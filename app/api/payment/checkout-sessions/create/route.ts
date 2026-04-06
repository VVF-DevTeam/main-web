import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
      // Event form responses
      formResponses,
    } = await req.json()

    // Create single line item for one ticket
    const lineItems = [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ]

    // Store checkout data in database if we have guest info or form responses
    // This is needed because Stripe metadata has a 500-character limit per value
    let checkoutDataId: string | undefined = undefined
    if (guestName || guestPhone || formResponses) {
      const checkoutData = await prisma.checkoutSessionData.create({
        data: {
          guestName: guestName || null,
          guestEmail: email || null,
          guestPhone: guestPhone || null,
          seatNumbers: seatNumber ? [seatNumber] : undefined,
          ticketMetadata: [{
            ticketId: eventTicketId,
            seatNumbers: seatNumber ? [seatNumber] : [],
            quantity: 1,
            type: type,
          }],
          formResponses: formResponses || undefined,
          status: 'PENDING',
        },
      })
      checkoutDataId = checkoutData.id
    }

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
        // If we stored data in CheckoutSessionData, use that
        // Otherwise, fallback to inline metadata (backward compatibility)
        ...(checkoutDataId ? { checkoutDataId } : {
          ...(guestName && { guestName: guestName }),
          ...(email && { guestEmail: email }),
          ...(guestPhone && { guestPhone: guestPhone }),
        }),
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
