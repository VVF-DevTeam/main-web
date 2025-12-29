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
      numberSession,
      email,
      seatNumber,
      eventTicketId,
      // Guest information (for payments without login)
      guestName,
      guestPhone,
    } = await req.json()

    // Create single line item for one ticket
    const lineItems = [
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
    ]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: type === 'Membership' ? 'subscription' : 'payment',
      customer_email: email,
      success_url:
        type === 'Membership'
          ? `${origin}/registration/membership/payment/success`
          : type === 'Concert'
            ? `${origin}/events/concert/${eventKeyName}/payment/success`
            : `${origin}/events/class/${eventKeyName}/payment/success`,
      cancel_url:
        type === 'Membership'
          ? `${origin}/registration/membership`
          : `${origin}/events/class/${eventKeyName}`,
      allow_promotion_codes: true,
      metadata: {
        userId: userId || '',
        eventId: eventId,
        stripePriceId: stripePriceId,
        stripeProductId: stripeProductId,
        eventTicketId: eventTicketId || '',
        type: type,
        ...(seatNumber && { seatNumber: seatNumber }),
        // Guest information (only if userId is not provided)
        ...(guestName && { guestName: guestName }),
        ...(email && { guestEmail: email }),
        ...(guestPhone && { guestPhone: guestPhone }),
        description:
          type === 'Membership'
            ? 'Monthly Membership'
            : type === 'Concert'
              ? `Concert Registration for ${eventKeyName}`
              : type === 'Class'
                ? `Class Registration for ${eventKeyName} with (${numberSession} sessions)`
                : `Ticket Registration for ${eventKeyName} with (${numberSession} sessions)`,
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
