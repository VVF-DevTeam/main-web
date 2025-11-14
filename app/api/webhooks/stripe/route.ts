import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { PaymentType } from '@prisma/client'
import { invalidatePaymentCache } from '@/lib/actions/payment/paymentCache'
import { sendPaymentConfirmationEmail } from '@/lib/actions/email/sendPaymentConfirmationEmail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

async function getRawBody(
  readable: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = readable.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  return Buffer.concat(chunks)
}

async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const { current_period_start, current_period_end } =
      subscription.items.data[0]

    const { id } = subscription.items.data[0].price

    return { current_period_start, current_period_end, stripePriceId: id }
  } catch (error) {
    console.error('[SUBSCRIPTION_RETRIEVE_ERROR]', error)
    return null
  }
}

async function updateSubscriptionMetadata(
  subscriptionId: string,
  metadata: Record<string, string>
) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      metadata,
    })
    return subscription
  } catch (error) {
    console.error('[SUBSCRIPTION_METADATA_UPDATE_ERROR]', error)
    return null
  }
}

async function getCheckoutSessionQuantity(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  })

  if (!session.line_items) return null

  return session.line_items.data.map((item) => item.quantity)[0] ?? null
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let bodyBuffer: Buffer
  try {
    bodyBuffer = await getRawBody(req.body as ReadableStream<Uint8Array>)
  } catch (error: unknown) {
    console.error('[RAW_BODY_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Failed to read raw body'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      bodyBuffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    console.error('[STRIPE_SIGNATURE_ERROR]', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Invalid Stripe webhook signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const successType: Stripe.Event['type'][] = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'invoice.paid',
  ]

  if (successType.includes(event.type)) {
    let paymentData:
      | Stripe.PaymentIntent
      | Stripe.Checkout.Session
      | Stripe.Invoice
    let chargedAmount: number = 0
    let subscriptionId: string | null = null
    let subscriptionEnd: number | null = null
    // let stripePriceId: string | null = null
    let metadata: Record<string, string> | null = null
    let quantity: number | null = null
    let paymentId: string | null = null

    if (event.type === 'payment_intent.succeeded') {
      paymentData = event.data.object as Stripe.PaymentIntent
      chargedAmount = paymentData.amount
      metadata = paymentData.metadata as Record<string, string>
      paymentId = paymentData.id
      quantity = 1
    } else if (event.type === 'invoice.paid') {
      // invoice.paid is triggered when a subscription is created or renewed
      // for this check, we only catch event when subscription is renewed, then it will have metadata.userId
      // otherwise, it will be handled in the checkout.session.completed event
      paymentData = event.data.object as Stripe.Invoice
      chargedAmount = paymentData.amount_paid

      // @ts-ignore - payment_intent exists on Invoice but not in type definition
      if (paymentData.payment_intent) {
        // @ts-ignore - payment_intent exists on Invoice but not in type definition
        paymentId = paymentData.payment_intent as string
      }

      // get metadata from the parent subscription
      metadata = paymentData.parent!.subscription_details!.metadata as Record<
        string,
        string
      >
      quantity = paymentData.lines.data.map((item) => item.quantity)[0] ?? 1

      // get subscription details
      if (paymentData.lines.data[0].subscription) {
        const subscriptionDetails = await getSubscriptionDetails(
          paymentData.lines.data[0].subscription as string
        )
        if (subscriptionDetails) {
          subscriptionEnd = subscriptionDetails.current_period_end
          // stripePriceId = subscriptionDetails.stripePriceId
        }
      }
    } else if (event.type === 'checkout.session.completed') {
      paymentData = event.data.object as Stripe.Checkout.Session
      chargedAmount = paymentData.amount_total ?? 0
      metadata = paymentData.metadata as Record<string, string>
      quantity = (await getCheckoutSessionQuantity(paymentData.id)) ?? 1
      paymentId = paymentData.payment_intent as string

      // if the payment is for a subscription, handled the first time payment
      if (paymentData.subscription) {
        subscriptionId = paymentData.subscription as string
        const subscriptionDetails = await getSubscriptionDetails(subscriptionId)
        if (subscriptionDetails) {
          subscriptionEnd = subscriptionDetails.current_period_end
          // stripePriceId = subscriptionDetails.stripePriceId
        }
      }
    } else {
      return NextResponse.json(
        { error: { message: 'Unsupported event type' } },
        { status: 400 }
      )
    }

    console.log('metadata', metadata)

    // in case paymentId is not found, set it to an empty string, then admin can ask devs to fix it
    if (!paymentId) {
      paymentId = ''
    }

    // filter out the event
    if (!metadata?.userId) {
      return NextResponse.json(
        { error: { message: 'Missing userId in metadata', data: paymentData } },
        { status: 400 }
      )
    }

    // Create payment record in database
    try {
      const expiresAt =
        metadata.type === 'Membership' && subscriptionEnd
          ? new Date(subscriptionEnd * 1000)
          : null

      await prisma.payment.create({
        data: {
          userId: metadata.userId,
          eventId: metadata.eventId,
          eventTicketId: metadata.eventTicketId,
          stripePaymentId: paymentId,
          pricePaid: chargedAmount / 100,
          type: metadata.type as PaymentType,
          expiresAt: expiresAt,
          quantity: quantity,
          seatNumber: metadata.seatNumber,
        },
      })

      // Send payment confirmation email for event tickets (not Membership)
      if (
        metadata.type !== 'Membership' &&
        metadata.eventId &&
        metadata.eventTicketId
      ) {
        try {
          // Fetch user data
          const user = await prisma.user.findUnique({
            where: { id: metadata.userId },
            select: { name: true, email: true },
          })

          // Fetch event and ticket data
          const ticket = await prisma.eventTicket.findUnique({
            where: { id: metadata.eventTicketId },
            include: {
              event: {
                select: {
                  title: true,
                  startDate: true,
                  endDate: true,
                  location: true,
                  days: true,
                  startTime: true,
                  endTime: true,
                },
              },
            },
          })

          // update event ticket sold count
          await prisma.eventTicket.update({
            where: { id: metadata.eventTicketId },
            data: {
              sold: { increment: 1 },
            },
          })

          // update event seatingMap
          if (metadata.seatNumber) {
            const event = await prisma.event.findUnique({
              where: { id: metadata.eventId },
              select: {
                seatingMap: true,
              },
            })

            console.log('event seatingMap', event?.seatingMap)

            if (event && event.seatingMap) {
              // Parse the seatingMap from JSON (if it's a string) or use directly (if already an object)
              const seatingMap = (
                typeof event.seatingMap === 'string'
                  ? JSON.parse(event.seatingMap)
                  : event.seatingMap
              ) as Array<
                Array<{
                  name?: string
                  status: number
                  ticketId?: string
                  ticketType?: string
                  price?: number
                  currency?: string
                }>
              >

              console.log('seatingMap', seatingMap)

              // Find and update the seat with matching seatNumber
              let seatFound = false
              for (let rowIndex = 0; rowIndex < seatingMap.length; rowIndex++) {
                const row = seatingMap[rowIndex]
                if (Array.isArray(row)) {
                  for (let colIndex = 0; colIndex < row.length; colIndex++) {
                    const seat = row[colIndex]
                    if (seat && seat.name === metadata.seatNumber) {
                      seat.status = 2 // OCCUPIED
                      seatFound = true
                      break
                    }
                  }
                  if (seatFound) break
                }
              }
              console.log('seatingMap after update', seatingMap)

              // Update the seatingMap in the database
              if (seatFound) {
                console.log('updating seatingMap in database')
                await prisma.event.update({
                  where: { id: metadata.eventId },
                  data: {
                    seatingMap: seatingMap,
                  },
                })
              }
            } else if (!event) {
              return NextResponse.json(
                {
                  error: {
                    message: 'Event not found, could not update seatingMap',
                  },
                },
                { status: 400 }
              )
            }
          }

          console.log('user', user)
          console.log('ticket', ticket)
          // send email confirmation for event tickets (not Membership)
          if (user && user.email && ticket) {
            const pricePaid = chargedAmount / 100
            const perSessionPrice = Number(ticket.price) || 0
            const firstName = user.name?.split(' ')[0] || 'Valued Customer'

            console.log('sending email confirmation')
            await sendPaymentConfirmationEmail({
              firstName,
              to: user.email,
              ticketType: ticket.type,
              pricePaid,
              quantity: quantity || 1,
              currency: ticket.currency || 'CAD',
              ticketImageUrl: ticket.imageUrl,
              perSessionPrice,
              payTotalNumber: ticket.payTotalNumber,
              eventTitle: ticket.event.title,
              seatNumber: metadata.seatNumber,
              eventStartDate: ticket.event.startDate,
              eventEndDate: ticket.event.endDate,
              eventLocation: ticket.event.location,
              eventStartTime: ticket.event.startTime,
              eventEndTime: ticket.event.endTime,
            })
          }
        } catch (emailError) {
          // Log email error but don't fail the webhook
          console.error('[PAYMENT_CONFIRMATION_EMAIL_ERROR]', emailError)
        }
      }

      // Update event ticket sold count
      // Invalidate payment cache after creating new payment
      invalidatePaymentCache()

      // add role member to user
      if (metadata.type === 'Membership') {
        await prisma.user.update({
          where: { id: metadata.userId },
          data: {
            subscribedAt: new Date(),
            subscribeExpires: expiresAt,
            stripeSubscriptionId: subscriptionId,
          },
        })

        // update subscription metadata for future subscription invoices
        if (subscriptionId) {
          await updateSubscriptionMetadata(subscriptionId, metadata)
        }
      }
    } catch (error) {
      console.error('[PRISMA_CREATE_PAYMENT_ERROR]', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save payment record to database'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  } else {
    console.log('Not supported event type', event.type)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
