import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Create Stripe product and price for a ticket
export async function POST(req: NextRequest) {
  try {
    const { eventId, eventUrl, title, price, currency = 'cad' } = await req.json()

    if (!title || price === undefined) {
      return NextResponse.json(
        { message: 'Missing title or price' },
        { status: 400 }
      )
    }

    const product = await stripe.products.create({
      name: title,
      metadata: { eventId, eventUrl },
    })

    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100),
      currency: currency.toLowerCase(),
      product: product.id,
    })

    return NextResponse.json({
      success: true,
      productId: product.id,
      priceId: stripePrice.id,
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
      currency = 'cad',
    } = await req.json()

    if (!stripeProductId || !stripePriceId) {
      return NextResponse.json(
        { message: 'Missing stripeProductId or stripePriceId' },
        { status: 400 }
      )
    }

    // Update the product if title is provided
    if (title) {
      await stripe.products.update(stripeProductId, {
        name: title,
        metadata: { eventId, eventUrl },
      })
    }

    // If price is provided, create a new price (prices are immutable)
    if (price !== undefined) {
      // Disable the old price
      await stripe.prices.update(stripePriceId, { active: false })

      // Create new price
      const newPrice = await stripe.prices.create({
        unit_amount: Math.round(price * 100),
        currency: currency.toLowerCase(),
        product: stripeProductId,
      })

      return NextResponse.json({
        success: true,
        newPriceId: newPrice.id,
      })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: unknown) {
    console.error('[STRIPE_TICKET_EDIT_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

