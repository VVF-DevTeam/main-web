import { createPostPaymentFormToken } from './postPaymentFormToken'

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
    params.set('paymentReference', paymentReference.trim())
  }

  params.set(
    'token',
    createPostPaymentFormToken({
      userId,
      paymentReference,
      eventKeyName,
      guestEmail,
    })
  )

  return `${baseUrl}/${locale}/events/${eventType.toLowerCase()}/${eventKeyName}/form?${params.toString()}`
}
