import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

interface ShopCheckoutItem {
  shopItemId: string
  stripePriceId: string
  stripeProductId: string
  quantity: number
}

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    const {
      shopSlug,
      userId,
      shopId,
      mainEmail,
      checkoutItems,
      // Guest information (for payments without login)
      guestName,
      guestPhone,
      otherGuestsInfo, // Array of other guests' information
    }: {
      shopSlug: string
      userId?: string
      shopId: string
      mainEmail: string
      checkoutItems: ShopCheckoutItem[]
      guestName?: string
      guestPhone?: string
      otherGuestsInfo?: Array<{ name: string; email: string; phone: string }>
    } = await req.json()

    if (!checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
      return NextResponse.json(
        { message: 'Invalid checkout items' },
        { status: 400 }
      )
    }

    // Create line items: one per quantity for each shop item
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    const shopItemMetadata: Array<{ shopItemId: string; quantity: number }> = []

    // Cache for Stripe prices
    const stripePriceCache = new Map<string, Stripe.Price>()

    // Calculate total from actual Stripe prices being used
    let totalAmount = 0

    for (const item of checkoutItems) {
      // Retrieve the actual Stripe price
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
      totalAmount += priceInDollars * item.quantity

      // Create line items based on quantity
      for (let i = 0; i < item.quantity; i++) {
        lineItems.push({
          price: item.stripePriceId,
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
        })
      }

      shopItemMetadata.push({
        shopItemId: item.shopItemId,
        quantity: item.quantity,
      })
    }

    // Save all checkout data to CheckoutSessionData before creating Stripe session
    const checkoutSessionData = await prisma.checkoutSessionData.create({
      data: {
        // Representative guest (main contact)
        guestName: guestName || undefined,
        guestEmail: mainEmail || undefined,
        guestPhone: guestPhone || undefined,
        // Shop item data (using ticketMetadata field for shop items)
        shopItemMetadata: shopItemMetadata.map((item) => ({
          shopItemId: item.shopItemId,
          quantity: item.quantity,
        })),
        otherGuestsInfo: otherGuestsInfo && Array.isArray(otherGuestsInfo) && otherGuestsInfo.length > 0
          ? otherGuestsInfo
          : undefined,
        // No form responses for shops
      },
    })

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: mainEmail,
      success_url: `${origin}/shop/payment/success`,
      cancel_url: `${origin}/shop`,
      allow_promotion_codes: true,
      metadata: {
        userId: userId || '',
        shopId: shopId,
        shopSlug: shopSlug,
        checkoutDataId: checkoutSessionData.id, // Store reference ID - all data is in CheckoutSessionData
        description: `Shop Purchase - ${shopItemMetadata.length} item${shopItemMetadata.length > 1 ? 's' : ''}`,
      },
    })

    // Update CheckoutSessionData with stripeSessionId for easier lookup
    await prisma.checkoutSessionData.update({
      where: { id: checkoutSessionData.id },
      data: { stripeSessionId: session.id },
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

