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
  });

  if (!session.line_items) return null;

  return session.line_items.data.map((item) => item.quantity)[0] ?? null;
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
    let stripePriceId: string | null = null
    let metadata: Record<string, string> | null = null
    let quantity: number | null = null

    if (event.type === 'payment_intent.succeeded') {
      paymentData = event.data.object as Stripe.PaymentIntent
      chargedAmount = paymentData.amount
      metadata = paymentData.metadata as Record<string, string>
      quantity = 1;
    } else if (event.type === 'invoice.paid') {
      // invoice.paid is triggered when a subscription is created or renewed
      // for this check, we only catch event when subscription is renewed, then it will have metadata.userId
      // otherwise, it will be handled in the checkout.session.completed event
      paymentData = event.data.object as Stripe.Invoice
      chargedAmount = paymentData.amount_paid

      // get metadata from the parent subscription (invoice created by checkout.session.completed will not have parent's metadata)
      // metadata = paymentData.lines.data[0].metadata as Record<string, string>
      metadata = paymentData.parent!.subscription_details!.metadata as Record<string, string>;
      quantity = paymentData.lines.data.map((item) => item.quantity)[0] ?? 1;

      // get subscription details
      if (paymentData.lines.data[0].subscription) {
        const subscriptionDetails = await getSubscriptionDetails(
          paymentData.lines.data[0].subscription as string
        )
        if (subscriptionDetails) {
          subscriptionEnd = subscriptionDetails.current_period_end
          stripePriceId = subscriptionDetails.stripePriceId
        }
      }
    } else if (event.type === 'checkout.session.completed') {
      paymentData = event.data.object as Stripe.Checkout.Session
      chargedAmount = paymentData.amount_total ?? 0
      metadata = paymentData.metadata as Record<string, string>
      quantity = await getCheckoutSessionQuantity(paymentData.id) ?? 1;

      // if the payment is for a subscription, handled the first time payment
      if (paymentData.subscription) {
        subscriptionId = paymentData.subscription as string
        const subscriptionDetails = await getSubscriptionDetails(subscriptionId)
        if (subscriptionDetails) {
          subscriptionEnd = subscriptionDetails.current_period_end
          stripePriceId = subscriptionDetails.stripePriceId
        }
      }
    } else {
      return NextResponse.json(
        { error: { message: 'Unsupported event type' } },
        { status: 400 }
      )
    }

    // filter out the event
    if (!metadata?.userId) {
      return NextResponse.json(
        { error: { message: 'Missing userId in metadata', data: paymentData } },
        { status: 400 }
      )
    }

    try {
      const expiresAt =
        metadata.type === 'Membership' && subscriptionEnd
          ? new Date(subscriptionEnd * 1000)
          : null

      await prisma.payment.create({
        data: {
          userId: metadata.userId,
          eventId: metadata.eventId,
          stripeProductId: metadata.stripeProductId,
          stripePriceId: stripePriceId || metadata.stripePriceId,
          pricePaid: chargedAmount / 100,
          type: metadata.type as PaymentType,
          expiresAt: expiresAt,
          quantity: quantity,
        },
      })

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
