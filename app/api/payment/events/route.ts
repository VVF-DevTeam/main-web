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

    return NextResponse.json({
      success: true,
      productId: product.id,
      priceId: stripePrice.id,
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
    const { eventId, eventUrl, title, price, stripeProductId, stripePriceId } =
      await req.json()

    if (!price) {
      return NextResponse.json({ message: 'Missing price' }, { status: 400 })
    }

    // since the price is immutable (unchangeable), we need to create a new price

    // disable the old price
    await stripe.prices.update(stripePriceId, { active: false })

    // update the product title
    if (title) {
      await stripe.products.update(stripeProductId, {
        name: title,
        metadata: { eventId, eventUrl },
      })
    }

    // create a new price and link it to the product
    const newPrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100),
      currency: 'cad',
      product: stripeProductId,
    })

    return NextResponse.json({
      success: true,
      newPriceId: newPrice.id,
    })
  } catch (error: unknown) {
    console.error('[STRIPE_EDIT_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
