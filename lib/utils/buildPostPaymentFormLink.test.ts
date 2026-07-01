import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { buildPostPaymentFormLink } from './buildPostPaymentFormLink'
import { verifyPostPaymentFormAccessToken } from './postPaymentFormAccessToken'

const originalAuthSecret = process.env.AUTH_SECRET
const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL

beforeEach(() => {
  process.env.AUTH_SECRET = 'test-post-payment-secret'
  process.env.NEXT_PUBLIC_BASE_URL = 'https://www.vietvibe.org'
})

afterAll(() => {
  process.env.AUTH_SECRET = originalAuthSecret
  process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
})

describe('buildPostPaymentFormLink', () => {
  test('adds a guest-scoped form token for paymentReference links', () => {
    const link = buildPostPaymentFormLink({
      userId: 'user_1',
      paymentReference: 'pi_123',
      eventKeyName: 'camp',
      eventType: 'festival',
      guestEmail: 'guest@example.com',
    })

    const url = new URL(link)
    const formToken = url.searchParams.get('formToken')

    expect(url.searchParams.get('paymentReference')).toBe('pi_123')
    expect(formToken).toBeTruthy()
    expect(
      verifyPostPaymentFormAccessToken({
        token: formToken,
        paymentReference: 'pi_123',
        eventKeyName: 'camp',
        guestEmail: 'guest@example.com',
      })
    ).toBe(true)
  })

  test('does not add a form token when no paymentReference is present', () => {
    const link = buildPostPaymentFormLink({
      userId: 'user_1',
      eventKeyName: 'camp',
      eventType: 'festival',
      guestEmail: 'guest@example.com',
    })

    const url = new URL(link)

    expect(url.searchParams.get('paymentReference')).toBeNull()
    expect(url.searchParams.get('formToken')).toBeNull()
  })
})
