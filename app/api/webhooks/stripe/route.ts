import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Helper: Convert ReadableStream to Buffer (for signature verification)
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

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const bodyBuffer = await getRawBody(req.body as ReadableStream<Uint8Array>)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      bodyBuffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Invalid Stripe signature:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata

    console.log('Webhook received!', metadata)
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 1,
          expand: ['data.price.product'], // optional: to preload product data
        }
      )

      if (!metadata?.userId || !metadata?.eventId) {
        return NextResponse.json(
          { error: 'Missing userId or eventId in metadata' },
          { status: 400 }
        )
      }

      const lineItem = lineItems.data[0]
      await prisma.payment.create({
        data: {
          userId: metadata?.userId,
          eventId: metadata?.eventId,
          stripeProductId: lineItem.price?.product?.toString() ?? '',
          stripePriceId: lineItem.price?.id ?? '',
          pricePaid: (session.amount_total ?? 0) / 100,
        },
      })
      
    } catch (err) {
      console.error('DB write failed:', err)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
