import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { subscriptionId } = await req.json()
    if (!subscriptionId) {
      return new NextResponse('Subscription ID is required', { status: 400 })
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return new NextResponse('Subscription cancelled successfully', { status: 200 })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 