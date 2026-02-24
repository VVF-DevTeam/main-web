import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

// Placeholder shop URL used in Stripe metadata until a real URL is wired in
const SHOP_URL_PLACEHOLDER = 'https://www.vietvibe.org/shop/placeholder'

// Create Stripe product and price for a shop item
export async function POST(req: NextRequest) {
  try {
    const {
      shopId,
      shopUrl = SHOP_URL_PLACEHOLDER,
      title,
      price,
      currency = 'cad',
      discountMemberPercent = null,
    } = await req.json()

    if (!title || price === undefined) {
      return NextResponse.json(
        { message: 'Missing title or price' },
        { status: 400 }
      )
    }

    if (!shopId) {
      return NextResponse.json(
        { message: 'Missing shopId' },
        { status: 400 }
      )
    }

    // Create product with shop metadata (itemId will be added later after item creation)
    const productMetadata: Record<string, string> = {
      shopId,
      shopUrl,
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
        shopId,
        shopUrl,
      },
    })

    // Calculate discounted price for members if discount is provided
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
        shopId,
        shopUrl,
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
    console.error('[STRIPE_SHOP_ITEM_CREATE_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

// Update Stripe product and price for a shop item
export async function PUT(req: NextRequest) {
  try {
    const {
      shopId,
      shopUrl = SHOP_URL_PLACEHOLDER,
      title,
      price,
      stripeProductId,
      stripePriceId,
      stripeSubscriptionPriceId,
      currency = 'cad',
      discountMemberPercent = null,
      itemId,
    } = await req.json()

    if (!stripeProductId) {
      return NextResponse.json(
        { message: 'Missing stripeProductId' },
        { status: 400 }
      )
    }

    // Handle one-time metadata update for itemId (only when itemId is provided without price)
    if (itemId && price === undefined) {
      const existingProduct = await stripe.products.retrieve(stripeProductId)
      const existingMetadata = existingProduct.metadata || {}

      const updateData: { metadata?: Record<string, string>; name?: string } = {}

      if (!existingMetadata.itemId) {
        updateData.metadata = {
          ...existingMetadata,
          shopId: shopId || existingMetadata.shopId || '',
          shopUrl: shopUrl || existingMetadata.shopUrl || SHOP_URL_PLACEHOLDER,
          itemId,
        }
      }

      if (title) {
        updateData.name = title
      }

      if (updateData.metadata || updateData.name) {
        await stripe.products.update(stripeProductId, updateData)
      }

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

    const shouldUpdateSubscriptionPrice =
      stripeSubscriptionPriceId &&
      discountMemberPercent !== undefined

    const existingPrice = await stripe.prices.retrieve(stripePriceId)
    const existingPriceAmount = existingPrice.unit_amount
      ? Math.round((existingPrice.unit_amount / 100) * 100) / 100
      : 0
    const newPriceAmount = Math.round(Number(price) * 100) / 100

    // Only create new price if the amount actually changed
    if (Math.abs(existingPriceAmount - newPriceAmount) > 0.001) {
      await stripe.prices.update(stripePriceId, { active: false })

      const newPrice = await stripe.prices.create({
        unit_amount: Math.round(newPriceAmount * 100),
        currency: currency.toLowerCase(),
        product: stripeProductId,
        nickname: 'Standard Price',
        metadata: {
          priceType: 'standard',
          shopId: shopId || '',
          shopUrl: shopUrl || SHOP_URL_PLACEHOLDER,
        },
      })

      newPriceId = newPrice.id
    } else {
      newPriceId = stripePriceId
    }

    // Update subscription price if needed
    if (shouldUpdateSubscriptionPrice) {
      const roundedPrice = Math.round(Number(price) * 100) / 100
      const discountedPrice =
        discountMemberPercent && discountMemberPercent > 0
          ? Math.round(roundedPrice * (1 - discountMemberPercent / 100) * 100) / 100
          : roundedPrice

      const existingSubPrice = await stripe.prices.retrieve(stripeSubscriptionPriceId)
      const existingSubPriceAmount = existingSubPrice.unit_amount
        ? Math.round((existingSubPrice.unit_amount / 100) * 100) / 100
        : 0
      const newSubPriceAmount = discountedPrice

      if (Math.abs(existingSubPriceAmount - newSubPriceAmount) > 0.01) {
        await stripe.prices.update(stripeSubscriptionPriceId, { active: false })

        const discountLabel =
          discountMemberPercent && discountMemberPercent > 0
            ? ` (${discountMemberPercent}% member discount)`
            : ''

        const newSubscribedPrice = await stripe.prices.create({
          unit_amount: Math.round(newSubPriceAmount * 100),
          currency: currency.toLowerCase(),
          product: stripeProductId,
          nickname: `Member Price${discountLabel}`,
          metadata: {
            priceType: 'subscribed',
            shopId: shopId || '',
            shopUrl: shopUrl || SHOP_URL_PLACEHOLDER,
            discountPercent: discountMemberPercent?.toString() || '0',
          },
        })

        newSubscriptionPriceId = newSubscribedPrice.id
      } else {
        const existingDiscount = existingSubPrice.metadata?.discountPercent
        const newDiscount = discountMemberPercent?.toString() || '0'

        if (existingDiscount !== newDiscount) {
          const discountLabel =
            discountMemberPercent && discountMemberPercent > 0
              ? ` (${discountMemberPercent}% member discount)`
              : ''

          await stripe.prices.update(stripeSubscriptionPriceId, {
            nickname: `Member Price${discountLabel}`,
            metadata: {
              priceType: 'subscribed',
              shopId: shopId || '',
              shopUrl: shopUrl || SHOP_URL_PLACEHOLDER,
              discountPercent: newDiscount,
            },
          })
        }

        newSubscriptionPriceId = stripeSubscriptionPriceId
      }
    }

    return NextResponse.json({
      success: true,
      ...(newPriceId && { newPriceId }),
      ...(newSubscriptionPriceId && { newSubscriptionPriceId }),
    })
  } catch (error: unknown) {
    console.error('[STRIPE_SHOP_ITEM_EDIT_ERROR]', error)
    const message =
      error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

