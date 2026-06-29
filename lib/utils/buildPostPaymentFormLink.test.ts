import { beforeEach, describe, expect, test } from 'vitest'
import { buildPostPaymentFormLink } from './buildPostPaymentFormLink'
import { verifyPostPaymentFormToken } from './postPaymentFormToken'

describe('buildPostPaymentFormLink', () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = 'test-post-payment-secret'
    process.env.NEXT_PUBLIC_BASE_URL = 'https://www.vietvibe.org'
  })

  test('signs the link so it is bound to the intended guest', () => {
    const link = buildPostPaymentFormLink({
      userId: 'user_1',
      paymentReference: 'pi_123',
      eventKeyName: 'camp',
      eventType: 'Concert',
      guestEmail: 'guest@example.com',
      locale: 'en',
    })

    const url = new URL(link)
    const token = url.searchParams.get('token')

    expect(token).toBeTruthy()
    expect(
      verifyPostPaymentFormToken({
        userId: url.searchParams.get('userId'),
        paymentReference: url.searchParams.get('paymentReference'),
        eventKeyName: 'camp',
        guestEmail: 'guest@example.com',
        token,
      })
    ).toBe(true)
    expect(
      verifyPostPaymentFormToken({
        userId: url.searchParams.get('userId'),
        paymentReference: url.searchParams.get('paymentReference'),
        eventKeyName: 'camp',
        guestEmail: 'other@example.com',
        token,
      })
    ).toBe(false)
  })
})
