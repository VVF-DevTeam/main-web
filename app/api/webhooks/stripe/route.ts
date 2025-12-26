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

      // Handle multi-ticket checkout with ticketMetadata
      let ticketMetadata: Array<{
        ticketId: string
        seatNumbers: string[]
      }> | null = null
      
      if (metadata.ticketMetadata) {
        try {
          ticketMetadata = JSON.parse(
            metadata.ticketMetadata as string
          ) as Array<{
            ticketId: string
            seatNumbers: string[]
          }>
        } catch (e) {
          console.error('Error parsing ticketMetadata:', e)
        }
      }

      ////// FOR MULTI-TICKET CHECKOUT //////
      if (ticketMetadata && ticketMetadata.length > 0) {
        // Multi-ticket checkout: create payment record for each ticket type
        // Fetch all tickets to get their actual prices
        const ticketIds = ticketMetadata.map((t) => t.ticketId)
        const tickets = await prisma.eventTicket.findMany({
          where: { id: { in: ticketIds } },
        })

        // Create a map of ticketId to ticket for quick lookup
        const ticketMap = new Map(tickets.map((t) => [t.id, t]))

        // Calculate total expected price based on ticket prices
        let totalExpectedPrice = 0
        for (const ticketInfo of ticketMetadata) {
          const ticket = ticketMap.get(ticketInfo.ticketId)
          if (ticket) {
            const ticketPrice = Number(ticket.price) || 0
            const totalTicketPrice =
              ticket.payTotalNumber && ticket.payTotalNumber > 0
                ? ticketPrice * ticket.payTotalNumber
                : ticketPrice
            totalExpectedPrice +=
              totalTicketPrice * ticketInfo.seatNumbers.length
          }
        }

        // Calculate price ratio if there's a discrepancy (due to discounts, rounding, etc.)
        const actualTotal = chargedAmount / 100
        const priceRatio =
          totalExpectedPrice > 0 ? actualTotal / totalExpectedPrice : 1

        for (const ticketInfo of ticketMetadata) {
          const ticket = ticketMap.get(ticketInfo.ticketId)
          if (!ticket) {
            console.warn(
              `[WEBHOOK_WARNING] EventTicket with id ${ticketInfo.ticketId} not found in ticketMap. Skipping payment creation.`
            )
            continue
          }

          const seatCount = ticketInfo.seatNumbers.length
          const ticketPrice = Number(ticket.price) || 0
          const totalTicketPrice =
            ticket.payTotalNumber && ticket.payTotalNumber > 0
              ? ticketPrice * ticket.payTotalNumber
              : ticketPrice

          // Calculate price for this ticket type, adjusted by ratio
          const ticketPricePaid = totalTicketPrice * seatCount * priceRatio

          await prisma.payment.create({
            data: {
              userId: metadata.userId,
              eventId: metadata.eventId,
              eventTicketId: ticketInfo.ticketId,
              stripePaymentId: paymentId,
              pricePaid: ticketPricePaid,
              type: metadata.type as PaymentType,
              expiresAt: expiresAt,
              quantity: seatCount,
              seatNumber: ticketInfo.seatNumbers.join(', '),
            },
          })

          // Update ticket sold count for this ticket type
          await prisma.eventTicket.update({
            where: { id: ticketInfo.ticketId },
            data: {
              sold: { increment: seatCount },
            },
          })
        }
      } else {
        // Single ticket checkout (backward compatibility)
        // Validate eventTicketId exists if provided
        // For Membership payments, eventTicketId should always be null
        let validEventTicketId: string | null = null
        if (
          metadata.type !== 'Membership' &&
          metadata.eventTicketId &&
          metadata.eventTicketId.trim() !== ''
        ) {
          const ticketExists = await prisma.eventTicket.findUnique({
            where: { id: metadata.eventTicketId },
            select: { id: true },
          })
          if (ticketExists) {
            validEventTicketId = metadata.eventTicketId
          } else {
            console.warn(
              `[WEBHOOK_WARNING] EventTicket with id ${metadata.eventTicketId} not found. Creating payment without eventTicketId.`
            )
          }
        }
        // For Membership or empty/invalid eventTicketId, validEventTicketId remains null

        await prisma.payment.create({
          data: {
            userId: metadata.userId,
            eventId: metadata.eventId,
            eventTicketId: validEventTicketId, // Will be null for Membership or empty strings
            stripePaymentId: paymentId,
            pricePaid: chargedAmount / 100,
            type: metadata.type as PaymentType,
            expiresAt: expiresAt,
            quantity: quantity,
            seatNumber: metadata.seatNumber,
          },
        })
      }

      // Send payment confirmation email for event tickets (not Membership)
      if (metadata.type !== 'Membership' && metadata.eventId) {
        try {
          // Fetch user data
          const user = await prisma.user.findUnique({
            where: { id: metadata.userId },
            select: { name: true, email: true },
          })

          // Handle multi-ticket checkout
          if (ticketMetadata && ticketMetadata.length > 0) {
            // For multi-ticket, send one email with all ticket types
            // Fetch all tickets
            const ticketIds = ticketMetadata.map((t) => t.ticketId)
            const tickets = await prisma.eventTicket.findMany({
              where: { id: { in: ticketIds } },
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

            // Use the first ticket for event details (they're all from the same event)
            const firstTicket = tickets[0]
            if (user && user.email && firstTicket) {
              const pricePaid = chargedAmount / 100
              const firstName = user.name?.split(' ')[0] || 'Valued Customer'
              const allSeatNumbers = ticketMetadata
                .flatMap((t) => t.seatNumbers)
                .join(', ')

              // Send email with combined information
              await sendPaymentConfirmationEmail({
                firstName,
                to: user.email,
                ticketType: tickets.map((t) => t.type).join(', '), // Combined ticket types
                pricePaid,
                quantity: quantity || allSeatNumbers.split(',').length,
                currency: firstTicket.currency || 'CAD',
                ticketImageUrl: firstTicket.imageUrl,
                perSessionPrice: Number(firstTicket.price) || 0,
                payTotalNumber: firstTicket.payTotalNumber,
                eventTitle: firstTicket.event.title,
                seatNumber: allSeatNumbers,
                eventStartDate: firstTicket.event.startDate,
                eventEndDate: firstTicket.event.endDate,
                eventLocation: firstTicket.event.location,
                eventStartTime: firstTicket.event.startTime,
                eventEndTime: firstTicket.event.endTime,
              })
            }
          } else if (metadata.eventTicketId) {
            // update event ticket sold count (only if not already updated in multi-ticket section)
            // Note: Ticket fetch for email is done later in the single-ticket email section
            if (!ticketMetadata) {
              await prisma.eventTicket.update({
                where: { id: metadata.eventTicketId },
                data: {
                  sold: { increment: 1 },
                },
              })
            }
          }

          // update event seatingMap - handle both single and multiple seats
          // Get seat numbers from ticketMetadata if available, otherwise from metadata
          const seatNumbersToUpdate: string[] = []
          if (ticketMetadata && ticketMetadata.length > 0) {
            // Use seat numbers from ticketMetadata (multi-ticket checkout)
            ticketMetadata.forEach((ticketInfo) => {
              seatNumbersToUpdate.push(...ticketInfo.seatNumbers)
            })
          } else if (metadata.seatNumbers) {
            // Multiple seats (backward compatibility)
            try {
              const parsed = JSON.parse(metadata.seatNumbers as string)
              if (Array.isArray(parsed)) {
                seatNumbersToUpdate.push(...parsed)
              }
            } catch (e) {
              console.error('Error parsing seatNumbers:', e)
            }
          } else if (metadata.seatNumber) {
            // Single seat (backward compatibility)
            seatNumbersToUpdate.push(metadata.seatNumber as string)
          }

          if (seatNumbersToUpdate.length > 0) {
            const event = await prisma.event.findUnique({
              where: { id: metadata.eventId },
              select: {
                seatingMap: true,
              },
            })

            if (!event) {
              console.error(
                'Event not found, could not update seatingMap',
                metadata.eventId
              )
              // Don't return error here - log and continue, as this shouldn't fail the webhook
            } else if (event.seatingMap) {
              try {
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

                // Find and update all seats with matching seatNumbers
                const seatsFound: string[] = []
                for (const seatNumberToUpdate of seatNumbersToUpdate) {
                  for (
                    let rowIndex = 0;
                    rowIndex < seatingMap.length;
                    rowIndex++
                  ) {
                    const row = seatingMap[rowIndex]
                    if (Array.isArray(row)) {
                      for (
                        let colIndex = 0;
                        colIndex < row.length;
                        colIndex++
                      ) {
                        const seat = row[colIndex]
                        if (seat && seat.name === seatNumberToUpdate) {
                          seat.status = 2 // OCCUPIED
                          seatsFound.push(seatNumberToUpdate)
                          break
                        }
                      }
                      if (seatsFound.includes(seatNumberToUpdate)) break
                    }
                  }
                }
                console.log('seats found and updated:', seatsFound)

                // Update the seatingMap in the database if at least one seat was found
                if (seatsFound.length > 0) {
                  console.log('updating seatingMap in database')
                  await prisma.event.update({
                    where: { id: metadata.eventId },
                    data: {
                      seatingMap: seatingMap,
                    },
                  })
                }
              } catch (parseError) {
                console.error(
                  'Error parsing or updating seatingMap:',
                  parseError
                )
                // Don't fail the webhook if seating map update fails
              }
            }
          }

          // Handle single ticket checkout email (if not already handled in multi-ticket section)
          if (!ticketMetadata && metadata.eventTicketId) {
            // Single ticket checkout (backward compatibility)
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

            // update event ticket sold count (only if not already updated in multi-ticket section)
            // Note: ticketMetadata is already null here since we're in the single-ticket path
            await prisma.eventTicket.update({
              where: { id: metadata.eventTicketId },
              data: {
                sold: { increment: 1 },
              },
            })

            console.log('user', user)
            console.log('ticket', ticket)
            // send email confirmation for single ticket
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
                seatNumber: (() => {
                  if (metadata.seatNumbers) {
                    try {
                      const parsed = JSON.parse(metadata.seatNumbers as string)
                      return Array.isArray(parsed)
                        ? parsed.join(', ')
                        : metadata.seatNumber
                    } catch (e) {
                      console.error('Error parsing seatNumbers in email:', e)
                      return metadata.seatNumber
                    }
                  }
                  return metadata.seatNumber
                })(),
                eventStartDate: ticket.event.startDate,
                eventEndDate: ticket.event.endDate,
                eventLocation: ticket.event.location,
                eventStartTime: ticket.event.startTime,
                eventEndTime: ticket.event.endTime,
              })
            }
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
