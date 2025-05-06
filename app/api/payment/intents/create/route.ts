import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { amount, classId, userId } = await req.json()

    if (!amount || !classId) {
      return NextResponse.json(
        { message: 'Missing amount or classId' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      metadata: {
        userId: userId,
        eventId: classId,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: unknown) {
    console.error('[PAYMENT_INTENT_CREATE_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
