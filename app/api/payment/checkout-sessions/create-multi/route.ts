import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { verifyEventDiscountCode } from '@/lib/actions/event/verifyEventDiscountCode'
import { getEventDiscountsAndTickets } from '@/lib/actions/event/getEventDiscountsAndTickets'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Shape of discounts stored in event.eventDiscounts JSON field
interface EventDiscountJson {
  id?: string
  type?: string
  percentage?: number
  minQuantity?: number | null
  minTotal?: number | null
  code?: string | null
  cannotBeStacked?: boolean | null
}


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
      discountCode, // Only the code - will be re-verified server-side
      // Guest information (for payments without login)
      guestName,
      guestPhone,
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
      // For non-seated tickets, seatNumbers is empty, so use quantity instead
      if (item.seatNumbers.length === 0 && (item as any).quantity) {
        totalItemCount += (item as any).quantity
      } else {
        totalItemCount += item.seatNumbers.length
      }
    })

    // Get event discounts from database (cached)
    const event = await getEventDiscountsAndTickets(eventId)

    // Calculate total from actual Stripe prices being used (not DB prices)
    // This ensures we use member prices if applicable, matching the frontend calculation
    let totalAfterMembership = 0
    const stripePriceCache = new Map<string, Stripe.Price>()
    
    for (const item of checkoutItems) {
      // Retrieve the actual Stripe price being used (could be member price)
      if (!stripePriceCache.has(item.stripePriceId)) {
        try {
          const stripePrice = await stripe.prices.retrieve(item.stripePriceId)
          stripePriceCache.set(item.stripePriceId, stripePrice)
        } catch (error) {
          console.error('Failed to retrieve Stripe price:', error)
          continue
        }
      }
      
      const stripePrice = stripePriceCache.get(item.stripePriceId)!
      const unitAmount = stripePrice.unit_amount || 0
      const priceInDollars = unitAmount / 100 // Convert cents to dollars
      
      if (item.seatNumbers.length > 0) {
        // Seated tickets: price per seat
        totalAfterMembership += priceInDollars * item.seatNumbers.length
      } else if ((item as any).quantity) {
        // Non-seated tickets: price * quantity
        // Note: Stripe prices already account for capacityPerTicket and payTotalNumber
        totalAfterMembership += priceInDollars * (item as any).quantity
      }
    }
    
    // Use totalAfterMembership as the base for discount calculations
    // (This matches the frontend logic where discounts are applied to totalAfterMembership)
    const baseTotal = totalAfterMembership

    // Normalize discounts JSON into a typed array
    const discountList: EventDiscountJson[] = event?.eventDiscounts && Array.isArray(event.eventDiscounts)
      ? (event.eventDiscounts as EventDiscountJson[])
      : []

    // Re-verify discount code server-side to prevent tampering
    let verifiedCodeDiscount: { code: string; percentage: number; cannotBeStacked: boolean } | null = null
    if (discountCode && typeof discountCode === 'string' && discountCode.trim()) {
      try {
        const verificationResult = await verifyEventDiscountCode({
          eventId,
          code: discountCode.trim(),
        })
        if (verificationResult.valid) {
          verifiedCodeDiscount = {
            code: verificationResult.code!,
            percentage: verificationResult.percentage!,
            cannotBeStacked: verificationResult.cannotBeStacked,
          }
        }
        // If verification fails, silently ignore (don't apply code discount)
      } catch (error) {
        console.error('Failed to verify discount code:', error)
        // Silently ignore verification errors
      }
    }

    // Calculate effective discount percentage using the same logic as EventCartCheckout.tsx
    let effectivePercent = 0

    if (discountList.length > 0 || verifiedCodeDiscount) {
      // First, calculate non-code discounts (Bulk Discount and Minimum Total Discount)
      let bestBulk: EventDiscountJson | null = null
      let bestMinTotal: EventDiscountJson | null = null

      discountList.forEach((discount) => {
        const pct = discount.percentage ?? 0
        if (pct <= 0) return

        if (discount.type === 'Bulk Discount') {
          const minQty = discount.minQuantity ?? 0
          const qualifies = totalItemCount > minQty
          if (!qualifies) return

          if (!bestBulk || (bestBulk.minQuantity ?? 0) < minQty) {
            bestBulk = discount
          }
        } else if (discount.type === 'Minimum Total Discount') {
          const minTotal = discount.minTotal ?? 0
          const qualifies = baseTotal >= minTotal
          if (!qualifies) return

          if (!bestMinTotal || (bestMinTotal.minTotal ?? 0) < minTotal) {
            bestMinTotal = discount
          }
        }
      })

      // Build the final list of qualifying non-code discounts
      const effectiveDiscounts: EventDiscountJson[] = []
      if (bestBulk) effectiveDiscounts.push(bestBulk)
      if (bestMinTotal) effectiveDiscounts.push(bestMinTotal)

      // Apply stacking rules over non-code discounts
      let stackablePercent = 0
      let bestNonStackablePercent = 0

      effectiveDiscounts.forEach((discount) => {
        const pct = discount.percentage ?? 0
        if (pct <= 0) return

        const isNonStackable = !!discount.cannotBeStacked

        if (isNonStackable) {
          bestNonStackablePercent = Math.max(bestNonStackablePercent, pct)
        } else {
          stackablePercent += pct
        }
      })

      // Calculate non-code discount percentage
      const nonCodePercent =
        stackablePercent > 0 && bestNonStackablePercent > 0
          ? Math.max(stackablePercent, bestNonStackablePercent)
          : stackablePercent > 0
            ? stackablePercent
            : bestNonStackablePercent
      effectivePercent = nonCodePercent

      // Now incorporate the Code Discount if verified
      if (verifiedCodeDiscount && verifiedCodeDiscount.percentage > 0) {
        const codePercent = verifiedCodeDiscount.percentage
        if (verifiedCodeDiscount.cannotBeStacked) {
          // Non-stackable: pick the better of code vs non-code
          if (codePercent > effectivePercent) {
            effectivePercent = codePercent
          }
        } else {
          // Stackable: always add on top of non-code percent
          effectivePercent += codePercent
        }
      }
    }

    // Apply discount at price level if effective discount > 0
    const shouldApplyDiscount = effectivePercent > 0 && type !== 'Membership'
    
    // Cache for discounted prices to avoid creating duplicates
    const discountedPriceCache = new Map<string, string>()

    // Calculate total discount amount matching frontend logic:
    // Frontend: bulkDiscountAmount = totalAfterMembership * (effectivePercent / 100)
    //          totalAfterBulk = totalAfterMembership - bulkDiscountAmount
    // We need to match this by rounding the total discount, then distributing across items
    let totalDiscountAmount = 0
    if (shouldApplyDiscount && effectivePercent > 0) {
      totalDiscountAmount = totalAfterMembership * (effectivePercent / 100)
      // Round to 2 decimal places (matching frontend)
      totalDiscountAmount = Math.round(totalDiscountAmount * 100) / 100
    }

    // Group items by price to calculate proportional discount distribution
    const priceGroups = new Map<string, Array<{ item: typeof checkoutItems[0]; unitCount: number; unitPrice: number }>>()
    
    for (const item of checkoutItems) {
      const key = item.stripePriceId
      if (!priceGroups.has(key)) {
        priceGroups.set(key, [])
      }
      
      // Get unit count and price
      const unitCount = item.seatNumbers.length > 0 
        ? item.seatNumbers.length 
        : ((item as any).quantity || 1)
      
      // Retrieve price to get unit amount
      if (!stripePriceCache.has(item.stripePriceId)) {
        try {
          const stripePrice = await stripe.prices.retrieve(item.stripePriceId)
          stripePriceCache.set(item.stripePriceId, stripePrice)
        } catch (error) {
          console.error('Failed to retrieve Stripe price:', error)
          continue
        }
      }
      
      const stripePrice = stripePriceCache.get(item.stripePriceId)!
      const unitPrice = (stripePrice.unit_amount || 0) / 100
      
      priceGroups.get(key)!.push({ item, unitCount, unitPrice })
    }

    // Calculate discounted prices for each price group
    for (const [priceId, group] of priceGroups.entries()) {
      if (!shouldApplyDiscount || effectivePercent === 0) {
        continue
      }
      
      // Calculate total for this price group
      const groupTotal = group.reduce((sum, g) => sum + (g.unitPrice * g.unitCount), 0)
      
      // Calculate discount for this group proportionally
      const groupDiscount = (groupTotal / totalAfterMembership) * totalDiscountAmount
      const groupFinalTotal = groupTotal - groupDiscount
      
      // Calculate discounted price per unit
      const totalUnits = group.reduce((sum, g) => sum + g.unitCount, 0)
      const discountedPricePerUnit = groupFinalTotal / totalUnits
      
      // Round to cents (Stripe requires integer cents)
      const discountedAmountInCents = Math.round(discountedPricePerUnit * 100)
      
      // Get first item's details for creating the price
      const firstItem = group[0].item
      if (!discountedPriceCache.has(priceId)) {
        try {
          const originalPrice = stripePriceCache.get(priceId)!
          
          const discountedPrice = await stripe.prices.create({
            unit_amount: discountedAmountInCents,
            currency: originalPrice.currency,
            product: firstItem.stripeProductId,
            metadata: {
              originalPriceId: priceId,
              discountType: 'event_discount',
              discountPercent: effectivePercent.toString(),
              ...(verifiedCodeDiscount && {
                codeDiscount: verifiedCodeDiscount.code,
                codeDiscountPercent: verifiedCodeDiscount.percentage.toString(),
              }),
            },
          })
          
          discountedPriceCache.set(priceId, discountedPrice.id)
        } catch (error) {
          console.error('Failed to create discounted price:', error)
        }
      }
    }

    for (const item of checkoutItems) {
      let priceIdToUse = item.stripePriceId
      
      // If discount applies, use the discounted price
      if (shouldApplyDiscount && discountedPriceCache.has(item.stripePriceId)) {
        priceIdToUse = discountedPriceCache.get(item.stripePriceId)!
      }
      
      // Create line items: one per seat for seated tickets, or use quantity for non-seated tickets
      if (item.seatNumbers.length > 0) {
        // Seated tickets: create one line item per seat
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
      } else if (item.quantity && item.quantity > 0) {
        // Non-seated tickets: create line items based on quantity
        const quantity = item.quantity
        for (let i = 0; i < quantity; i++) {
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
        }
      }

      ticketMetadata.push({
        ticketId: item.eventTicketId,
        seatNumbers: item.seatNumbers, // Empty array for non-seated tickets
        ...(item.seatNumbers.length === 0 && item.quantity && {
          quantity: item.quantity, // Include quantity for non-seated tickets
        }),
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
        userId: userId || '',
        eventId: eventId,
        type: type,
        seatNumbers: JSON.stringify(allSeatNumbers),
        ticketMetadata: JSON.stringify(ticketMetadata), // Store which seats belong to which ticket type
        // Guest information (only if userId is not provided)
        ...(guestName && { guestName: guestName }),
        ...(email && { guestEmail: email }),
        ...(guestPhone && { guestPhone: guestPhone }),
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

