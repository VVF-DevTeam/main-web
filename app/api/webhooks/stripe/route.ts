import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

async function getRawBody(readable: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = readable.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  return Buffer.concat(chunks)
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
    const message = error instanceof Error ? error.message : 'Failed to read raw body'
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
    const message = error instanceof Error ? error.message : 'Invalid Stripe webhook signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata

    console.log('Webhook received!', metadata)

    if (!metadata?.userId || !metadata?.eventId) {
      return NextResponse.json(
        { error: 'Missing userId or eventId in metadata' },
        { status: 400 }
      )
    }

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 1,
        expand: ['data.price.product'],
      })

      const lineItem = lineItems.data[0]

      await prisma.payment.create({
        data: {
          userId: metadata.userId,
          eventId: metadata.eventId,
          stripeProductId: lineItem.price?.product?.toString()!,
          stripePriceId: lineItem.price?.id!,
          pricePaid: (session.amount_total ?? 0) / 100,
        },
      })
    } catch (error: unknown) {
      console.error('[STRIPE_CREATE_PAYMENT_ERROR]', error)
      const message = error instanceof Error ? error.message : 'Failed to create payment record'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}