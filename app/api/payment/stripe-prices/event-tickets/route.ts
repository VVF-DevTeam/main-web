import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Create Stripe product and price for an event ticket
export async function POST(req: NextRequest) {
  try {
    const { eventId, eventUrl, title, price, currency = 'cad', discountMemberPercent = null } = await req.json()

    if (!title || price === undefined) {
      return NextResponse.json(
        { message: 'Missing title or price' },
        { status: 400 }
      )
    }

    // Create product with event metadata (ticketId will be added later after ticket creation)
    const productMetadata: Record<string, string> = {
      eventId,
      eventUrl,
    }

    const product = await stripe.products.create({
      name: title,
      metadata: productMetadata,
    })

    // Ensure price is properly rounded to 2 decimal places before converting to cents
    const roundedPrice = Math.round(Number(price) * 100) / 100

    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(roundedPrice * 100),
      currency: currency.toLowerCase(),
      product: product.id,
      nickname: 'Standard Price',
      metadata: {
        priceType: 'standard',
        eventId,
        eventUrl,
      },
    })

    // Calculate discounted price for members if discount is provided
    // If discount is null, use the same price (no discount)
    // Round to 2 decimal places to avoid floating-point precision issues
    const discountedPrice =
      discountMemberPercent && discountMemberPercent > 0
        ? Math.round(roundedPrice * (1 - discountMemberPercent / 100) * 100) / 100
        : roundedPrice

    const discountLabel =
      discountMemberPercent && discountMemberPercent > 0
        ? ` (${discountMemberPercent}% member discount)`
        : ''

    const subscribedStripePrice = await stripe.prices.create({
      unit_amount: Math.round(discountedPrice * 100),
      currency: currency.toLowerCase(),
      product: product.id,
      nickname: `Member Price${discountLabel}`,
      metadata: {
        priceType: 'subscribed',
        eventId,
        eventUrl,
        discountPercent: discountMemberPercent?.toString() || '0',
      },
    })

    return NextResponse.json({
      success: true,
      productId: product.id,
      priceId: stripePrice.id,
      subscribedPriceId: subscribedStripePrice.id,
    })
  } catch (error: unknown) {
    console.error('[STRIPE_TICKET_CREATE_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

// Update Stripe product and price for a ticket
export async function PUT(req: NextRequest) {
  try {
    const {
      eventId,
      eventUrl,
      title,
      price,
      stripeProductId,
      stripePriceId,
      stripeSubscriptionPriceId,
      currency = 'cad',
      discountMemberPercent = null,
      ticketId,
    } = await req.json()

    if (!stripeProductId) {
      return NextResponse.json(
        { message: 'Missing stripeProductId' },
        { status: 400 }
      )
    }

    // Handle one-time metadata update for ticketId (only when ticketId is provided without price)
    // This happens immediately after ticket creation to add ticketId to product metadata
    // Metadata is only set once when the product is first created or immediately after ticket creation
    if (ticketId && price === undefined) {
      const existingProduct = await stripe.products.retrieve(stripeProductId)
      const existingMetadata = existingProduct.metadata || {}
      
      // Prepare update object
      const updateData: { metadata?: Record<string, string>; name?: string } = {}
      
      // Only update metadata if ticketId is not already in metadata (one-time only)
      if (!existingMetadata.ticketId) {
        updateData.metadata = {
          ...existingMetadata,
          eventId: eventId || existingMetadata.eventId || '',
          eventUrl: eventUrl || existingMetadata.eventUrl || '',
          ticketId,
        }
      }
      
      // Update product name if title is provided
      if (title) {
        updateData.name = title
      }
      
      // Update product if there's anything to update
      if (updateData.metadata || updateData.name) {
        await stripe.products.update(stripeProductId, updateData)
      }
      
      // Return early for metadata-only update (no price updates, no stripePriceId required)
      return NextResponse.json({
        success: true,
      })
    }

    // For price updates, price and stripePriceId must be provided
    if (price === undefined) {
      return NextResponse.json(
        { message: 'Missing price (required for price updates)' },
        { status: 400 }
      )
    }

    if (!stripePriceId) {
      return NextResponse.json(
        { message: 'Missing stripePriceId (required for price updates)' },
        { status: 400 }
      )
    }

    // Update product name if title is provided (metadata is not updated during price changes)
    if (title) {
      await stripe.products.update(stripeProductId, {
        name: title,
      })
    }

    let newPriceId: string | undefined
    let newSubscriptionPriceId: string | undefined

    // Update subscription price if subscription price ID exists and we have price and discount info
    // This should happen if discount changed OR if price changed (need to recalculate discount)
    const shouldUpdateSubscriptionPrice =
      stripeSubscriptionPriceId &&
      discountMemberPercent !== undefined

    // Get the existing price to compare
    const existingPrice = await stripe.prices.retrieve(stripePriceId)
    // Round to 2 decimal places to avoid floating-point precision issues
    const existingPriceAmount = existingPrice.unit_amount
      ? Math.round((existingPrice.unit_amount / 100) * 100) / 100
      : 0
    // Ensure price is rounded to 2 decimal places
    const newPriceAmount = Math.round(Number(price) * 100) / 100

    // Only create new price if the amount actually changed (using tolerance for floating-point comparison)
    if (Math.abs(existingPriceAmount - newPriceAmount) > 0.001) {
      // Disable the old price
      await stripe.prices.update(stripePriceId, { active: false })

      // Create new price - ensure we round to cents properly
      const newPrice = await stripe.prices.create({
        unit_amount: Math.round(newPriceAmount * 100),
        currency: currency.toLowerCase(),
        product: stripeProductId,
        nickname: 'Standard Price',
        metadata: {
          priceType: 'standard',
          eventId,
          eventUrl,
        },
      })

      newPriceId = newPrice.id
    } else {
      // Price didn't change, keep the existing price ID
      newPriceId = stripePriceId
    }

    // Update subscription price if needed
    if (shouldUpdateSubscriptionPrice) {
      // Ensure price is rounded to 2 decimal places
      const roundedPrice = Math.round(Number(price) * 100) / 100

      // Calculate discounted price for members
      // If discount is null or 0, use the same price (no discount)
      // Round to 2 decimal places to avoid floating-point precision issues
      const discountedPrice =
        discountMemberPercent && discountMemberPercent > 0
          ? Math.round(roundedPrice * (1 - discountMemberPercent / 100) * 100) / 100
          : roundedPrice

      // Get the existing subscription price to compare
      const existingSubPrice = await stripe.prices.retrieve(stripeSubscriptionPriceId)
      // Round to 2 decimal places to avoid floating-point precision issues
      const existingSubPriceAmount = existingSubPrice.unit_amount
        ? Math.round((existingSubPrice.unit_amount / 100) * 100) / 100
        : 0
      const newSubPriceAmount = discountedPrice

      // Only create new subscription price if the amount actually changed
      if (Math.abs(existingSubPriceAmount - newSubPriceAmount) > 0.01) {
        // Disable the old subscription price
        await stripe.prices.update(stripeSubscriptionPriceId, { active: false })

        // Create discount label for nickname
        const discountLabel =
          discountMemberPercent && discountMemberPercent > 0
            ? ` (${discountMemberPercent}% member discount)`
            : ''

        // Create new subscription price
        const newSubscribedPrice = await stripe.prices.create({
          unit_amount: Math.round(newSubPriceAmount * 100),
          currency: currency.toLowerCase(),
          product: stripeProductId,
          nickname: `Member Price${discountLabel}`,
          metadata: {
            priceType: 'subscribed',
            eventId,
            eventUrl,
            discountPercent: discountMemberPercent?.toString() || '0',
          },
        })

        newSubscriptionPriceId = newSubscribedPrice.id
      } else {
        // Subscription price didn't change, but update nickname/metadata if discount changed
        // Get existing metadata to check if discount changed
        const existingDiscount = existingSubPrice.metadata?.discountPercent
        const newDiscount = discountMemberPercent?.toString() || '0'
        
        if (existingDiscount !== newDiscount) {
          // Update metadata to reflect new discount, even if price didn't change
          const discountLabel =
            discountMemberPercent && discountMemberPercent > 0
              ? ` (${discountMemberPercent}% member discount)`
              : ''
          
          await stripe.prices.update(stripeSubscriptionPriceId, {
            nickname: `Member Price${discountLabel}`,
            metadata: {
              priceType: 'subscribed',
              eventId,
              eventUrl,
              discountPercent: newDiscount,
            },
          })
        }
        
        // Keep the existing price ID
        newSubscriptionPriceId = stripeSubscriptionPriceId
      }
    }

    return NextResponse.json({
      success: true,
      ...(newPriceId && { newPriceId }),
      ...(newSubscriptionPriceId && { newSubscriptionPriceId }),
    })
  } catch (error: unknown) {
    console.error('[STRIPE_TICKET_EDIT_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

