import { createPostPaymentFormAccessToken } from '@/lib/utils/postPaymentFormAccessToken'

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
}): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ??
    'https://www.vietvibe.org'

  const params = new URLSearchParams({
    guestEmail: guestEmail.trim(),
  })

  if (userId?.trim()) {
    params.set('userId', userId.trim())
  }

  if (paymentReference?.trim()) {
    const normalizedPaymentReference = paymentReference.trim()

    params.set('paymentReference', normalizedPaymentReference)
    params.set(
      'formToken',
      createPostPaymentFormAccessToken({
        paymentReference: normalizedPaymentReference,
        eventKeyName,
        guestEmail,
      })
    )
  }

  return `${baseUrl}/${locale}/events/${eventType.toLowerCase()}/${eventKeyName}/form?${params.toString()}`
}
