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
    
    // Count total items to determine if discount applies
    let totalItemCount = 0
    checkoutItems.forEach((item) => {
      totalItemCount += item.seatNumbers.length
    })
    
    // Apply 10% discount at price level if more than 3 items (allows users to still enter promotion codes)
    const shouldApplyDiscount = totalItemCount > 3 && type !== 'Membership'
    
    // Cache for discounted prices to avoid creating duplicates
    const discountedPriceCache = new Map<string, string>()

    for (const item of checkoutItems) {
      let priceIdToUse = item.stripePriceId
      
      // If discount applies, create or retrieve discounted price
      if (shouldApplyDiscount) {
        if (!discountedPriceCache.has(item.stripePriceId)) {
          try {
            // Retrieve original price to get amount
            const originalPrice = await stripe.prices.retrieve(item.stripePriceId)
            
            // Calculate 10% discount
            const originalAmount = originalPrice.unit_amount || 0
            const discountedAmount = Math.round(originalAmount * 0.85)
            
            // Create a discounted price
            const discountedPrice = await stripe.prices.create({
              unit_amount: discountedAmount,
              currency: originalPrice.currency,
              product: item.stripeProductId,
              metadata: {
                originalPriceId: item.stripePriceId,
                discountType: 'bulk_10_percent',
              },
            })
            
            discountedPriceCache.set(item.stripePriceId, discountedPrice.id)
            priceIdToUse = discountedPrice.id
          } catch (error) {
            // If price creation fails, use original price
            console.error('Failed to create discounted price:', error)
            priceIdToUse = item.stripePriceId
          }
        } else {
          priceIdToUse = discountedPriceCache.get(item.stripePriceId)!
        }
      }
      
      // Create one line item per seat for this ticket type
      item.seatNumbers.forEach((seatNumber: string) => {
        lineItems.push({
          price: priceIdToUse,
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

