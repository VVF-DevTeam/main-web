import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { eventId, eventUrl, title, price } = await req.json()

    if (!title || !price) {
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
      currency: 'cad',
      product: product.id,
    })

    const subscribedStripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 0.8 * 100),
      currency: 'cad',
      product: product.id,
    })

    return NextResponse.json({
      success: true,
      productId: product.id,
      priceId: stripePrice.id,
      subscribedPriceId: subscribedStripePrice.id,
    })
  } catch (error: unknown) {
    console.error('[STRIPE_CREATE_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      eventId,
      eventUrl,
      title,
      description,
      price,
      stripeProductId,
      stripePriceId, // sent to disable the old price
      subscribedPriceId,
    } = await req.json()

    // since the price is immutable (unchangeable), we need to create a new price
    // in this API, we will update both product and price, so only send the variables you want to update

    // update the product title if have value
    if (title) {
      await stripe.products.update(stripeProductId, {
        name: title,
        metadata: { eventId, eventUrl },
      })
    }

    // update the product description if have value
    if (description) {
      await stripe.products.update(stripeProductId, {
        description: description,
      })
    }

    // update the price if have stripePriceId and price
    if (stripePriceId || price || subscribedPriceId) {
      // Ensure both price and stripePriceId are provided
      if (!stripePriceId || !price || !subscribedPriceId) {
        return NextResponse.json(
          { message: 'Missing price or stripePriceId or subscribedPriceId' },
          { status: 400 }
        )
      }

      // disable the old prices
      await stripe.prices.update(stripePriceId, { active: false })
      await stripe.prices.update(subscribedPriceId, { active: false })

      // create new prices and link it to the product, return new price id
      const newPrice = await stripe.prices.create({
        unit_amount: Math.round(price * 100),
        currency: 'cad',
        product: stripeProductId,
      })

      const newSubscribedPrice = await stripe.prices.create({
        unit_amount: Math.round(price * 0.8 * 100),
        currency: 'cad',
        product: stripeProductId,
      })

      return NextResponse.json({
        success: true,
        newPriceId: newPrice.id,
        newSubscribedPriceId: newSubscribedPrice.id,
      })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: unknown) {
    console.error('[STRIPE_EDIT_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
