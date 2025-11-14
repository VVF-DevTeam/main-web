import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const {
      eventKeyName,
      userId,
      eventId,
      type,
      email,
      checkoutItems,
    } = await req.json()

    if (!checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
      return NextResponse.json(
        { message: 'Invalid checkout items' },
        { status: 400 }
      )
    }

    // Create line items: one per seat, grouped by ticket type
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    const allSeatNumbers: string[] = []
    const ticketMetadata: Array<{ ticketId: string; seatNumbers: string[] }> = []

    checkoutItems.forEach((item: {
      ticketId: string
      stripePriceId: string
      stripeProductId: string
      seatNumbers: string[]
      eventTicketId: string
    }) => {
      // Create one line item per seat for this ticket type
      item.seatNumbers.forEach((seatNumber) => {
        lineItems.push({
          price: item.stripePriceId,
          quantity: 1,
          ...(type === 'Membership'
            ? {}
            : {
                adjustable_quantity: {
                  enabled: false,
                },
              }),
        })
        allSeatNumbers.push(seatNumber)
      })

      ticketMetadata.push({
        ticketId: item.eventTicketId,
        seatNumbers: item.seatNumbers,
      })
    })

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
      discounts: [],
      allow_promotion_codes: true,
      metadata: {
        userId: userId,
        eventId: eventId,
        type: type,
        seatNumbers: JSON.stringify(allSeatNumbers),
        ticketMetadata: JSON.stringify(ticketMetadata), // Store which seats belong to which ticket type
        description:
          type === 'Membership'
            ? 'Monthly Membership'
            : type === 'Concert'
              ? allSeatNumbers.length > 1
                ? `Concert Registration for ${eventKeyName} - ${allSeatNumbers.length} seats`
                : `Concert Registration for ${eventKeyName}`
              : type === 'Class'
                ? `Class Registration for ${eventKeyName}`
                : `Ticket Registration for ${eventKeyName}`,
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

