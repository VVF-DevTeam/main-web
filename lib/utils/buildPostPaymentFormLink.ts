export function buildPostPaymentFormLink({
  userId,
  paymentRef,
  eventKeyName,
  eventType,
  guestEmail,
  locale = 'en',
}: {
  userId?: string
  paymentRef?: string
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

  if (paymentRef?.trim()) {
    params.set('paymentRef', paymentRef.trim())
  }

  return `${baseUrl}/${locale}/events/${eventType.toLowerCase()}/${eventKeyName}/form?${params.toString()}`
}
