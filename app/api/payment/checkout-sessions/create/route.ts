import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const { stripePriceId, classKeyName, userId, classId } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/events/class/${classKeyName}/payment/success`,
      cancel_url: `${origin}/events/class/${classKeyName}`,
      metadata: {
        userId: userId,
        eventId: classId,
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
