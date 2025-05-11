import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function GET(
  req: Request,
  context: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const subscriptionId = (await context.params).subscriptionId
    if (!subscriptionId) {
      return new NextResponse('Subscription ID is required', { status: 400 })
    }

    // Get the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    return NextResponse.json({
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 