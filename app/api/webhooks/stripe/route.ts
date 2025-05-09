import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { PaymentType } from '@prisma/client'

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
    // get subscription start and end date
    const { current_period_start, current_period_end } = subscription.items.data[0]

    // get subscription price id
    const { id } = subscription.items.data[0].price
    return { current_period_start, current_period_end, stripePriceId: id }
  } catch (error) { 
    console.error('[SUBSCRIPTION_RETRIEVE_ERROR]', error)
    return null
  }
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

  // handle successful payment
  const successType = ['checkout.session.completed', 'payment_intent.succeeded']

  if (successType.includes(event.type)) {
    let paymentData: Stripe.PaymentIntent | Stripe.Checkout.Session
    let chargedAmount: number
    let subscriptionEnd = null
    let stripePriceId = null

    if (event.type === 'payment_intent.succeeded') {
      paymentData = event.data.object as Stripe.PaymentIntent
      chargedAmount = paymentData.amount
    } else {
      paymentData = event.data.object as Stripe.Checkout.Session
      chargedAmount = paymentData.amount_total!

      if (paymentData.subscription) {
        const subscriptionDetails = await getSubscriptionDetails(paymentData.subscription as string)
        if (subscriptionDetails) {
          subscriptionEnd = subscriptionDetails.current_period_end
          stripePriceId = subscriptionDetails.stripePriceId
        }
      }
    }

    const metadata = paymentData.metadata

    if (!metadata?.userId) {
      return NextResponse.json(
        { error: 'Missing userId in metadata' },
        { status: 400 }
      )
    }

    try {
      const expiresAt = metadata.type === 'Membership' && subscriptionEnd 
        ? new Date(subscriptionEnd * 1000)  // Convert Unix timestamp to milliseconds
        : null

      await prisma.payment.create({
        data: {
          userId: metadata.userId,
          eventId: metadata.eventId,
          stripeProductId: metadata.stripeProductId,
          stripePriceId: stripePriceId || metadata.stripePriceId,
          pricePaid: (chargedAmount ?? 0) / 100,
          type: metadata.type as PaymentType,
          expiresAt: expiresAt,
        },
      })

      // add role member to user
      if (metadata.type === 'Membership') {
        await prisma.user.update({
          where: { id: metadata.userId },
          data: {
            subscribedAt: new Date(),
            subscribeExpires: expiresAt,
          },
        })
      }
    } catch (error: unknown) {
      console.error('[PRISMA_CREATE_PAYMENT_ERROR]', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save payment record to database using prisma'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  } else {
    console.log('Not supported event type', event)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
