export function buildPostPaymentFormLink({
  userId,
  eventKeyName,
  eventType,
  guestEmail,
  locale = 'en',
}: {
  userId: string
  eventKeyName: string
  eventType: string
  guestEmail: string
  locale?: string
}): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ??
    'https://www.vietvibe.org'

  const params = new URLSearchParams({
    userId,
    guestEmail: guestEmail.trim(),
  })

  return `${baseUrl}/${locale}/events/${eventType.toLowerCase()}/${eventKeyName}/form?${params.toString()}`
}
