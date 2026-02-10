'use server'

import Stripe from 'stripe'
import { auth } from '@/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function getSubscriptionStatus(subscriptionId: string | null) {
  if (!subscriptionId) return null

  const session = await auth()
  if (!session?.user) return null

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return {
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status,
    }
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return null
  }
}

