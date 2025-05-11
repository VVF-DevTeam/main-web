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
      price,
      numberSession,
    } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        // If price is provided, use it as the price for the product (this is for full course payment)
        price
          ? {
              price_data: {
                product: stripeProductId,
                currency: 'cad',
                unit_amount: price * 100,
              },
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
            }
          : {
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
        description:
          type === 'Membership'
            ? 'Monthly Membership'
            : numberSession
              ? `Full Course Registration (${numberSession} sessions) for ${eventKeyName}`
              : `Drop-in for ${eventKeyName}`,
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
