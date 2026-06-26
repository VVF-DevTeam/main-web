import { createPostPaymentFormAccessToken } from './postPaymentFormAccessToken'

export function buildPostPaymentFormLink({
  userId,
  paymentReference,
  eventKeyName,
  eventType,
  guestEmail,
  locale = 'en',
}: {
  userId?: string | null
  paymentReference?: string | null
  eventKeyName: string
  eventType: string
  guestEmail: string
  locale?: string
}): string | null {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ??
    'https://www.vietvibe.org'

  const accessToken = createPostPaymentFormAccessToken({
    userId,
    paymentReference,
    eventKeyName,
    guestEmail,
  })

  if (!accessToken) {
    return null
  }

  const params = new URLSearchParams({
    guestEmail: guestEmail.trim(),
    accessToken,
  })

  if (userId?.trim()) {
    params.set('userId', userId.trim())
  }

  if (paymentReference?.trim()) {
    params.set('paymentReference', paymentReference.trim())
  }

  return `${baseUrl}/${locale}/events/${eventType.toLowerCase()}/${eventKeyName}/form?${params.toString()}`
}
