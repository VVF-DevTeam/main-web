import { describe, expect, test } from 'vitest'
import {
  shouldSkipDuplicateStripeSuccessEvent,
  shouldSkipInitialSubscriptionInvoice,
} from './stripeWebhookPaymentGate'

describe('stripeWebhookPaymentGate', () => {
  test('skips payment_intent.succeeded when checkout session metadata is present', () => {
    expect(
      shouldSkipDuplicateStripeSuccessEvent('payment_intent.succeeded', {
        checkoutDataId: 'checkout_1',
      })
    ).toBe(true)
  })

  test('processes payment_intent.succeeded for direct intents without checkoutDataId', () => {
    expect(
      shouldSkipDuplicateStripeSuccessEvent('payment_intent.succeeded', {
        userId: 'user_1',
      })
    ).toBe(false)
  })

  test('processes checkout.session.completed even when checkoutDataId is present', () => {
    expect(
      shouldSkipDuplicateStripeSuccessEvent('checkout.session.completed', {
        checkoutDataId: 'checkout_1',
      })
    ).toBe(false)
  })

  test('skips the initial subscription invoice because checkout.session.completed owns it', () => {
    expect(
      shouldSkipInitialSubscriptionInvoice('invoice.paid', 'subscription_create')
    ).toBe(true)
  })

  test('processes subscription renewal invoices', () => {
    expect(
      shouldSkipInitialSubscriptionInvoice('invoice.paid', 'subscription_cycle')
    ).toBe(false)
  })
})
