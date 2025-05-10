import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const {
      stripePriceId,
      stripeProductId,
      eventKeyName,
      userId,
      eventId,
      type,
    } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
          ...(type === 'Membership'
            ? {}
            : {
                adjustable_quantity: {
                  enabled: true,
                  minimum: 1,
                  maximum: 10,
                },
              }),
        },
      ],
      mode: type === 'Membership' ? 'subscription' : 'payment',
      success_url:
        type === 'Membership'
          ? `${origin}/registration/membership/payment/success`
          : `${origin}/events/class/${eventKeyName}/payment/success`,
      cancel_url:
        type === 'Membership'
          ? `${origin}/registration/membership`
          : `${origin}/events/class/${eventKeyName}`,
      metadata: {
        userId: userId,
        eventId: eventId,
        stripePriceId: stripePriceId,
        stripeProductId: stripeProductId,
        type: type,
      },
    })

    return NextResponse.json({ id: session.id })
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Stripe session creation failed' },
      { status: 500 }
    )
  }
}
