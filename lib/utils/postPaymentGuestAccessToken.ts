import { createHmac, timingSafeEqual } from 'node:crypto'

type PostPaymentGuestAccessTokenInput = {
  paymentReference: string
  eventKeyName: string
  guestEmail: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizeEventKeyName(eventKeyName: string): string {
  return eventKeyName.trim().toLowerCase()
}

function getPostPaymentGuestAccessSecret(): string {
  const secret =
    process.env.AUTH_SECRET?.trim() || process.env.SECRET_TRUST_CLIENT?.trim()

  if (!secret) {
    throw new Error('Missing secret for post-payment guest access tokens')
  }

  return secret
}

function buildPostPaymentGuestAccessPayload({
  paymentReference,
  eventKeyName,
  guestEmail,
}: PostPaymentGuestAccessTokenInput): string {
  return [
    paymentReference.trim(),
    normalizeEventKeyName(eventKeyName),
    normalizeEmail(guestEmail),
  ].join(':')
}

export function createPostPaymentGuestAccessToken(
  input: PostPaymentGuestAccessTokenInput
): string {
  return createHmac('sha256', getPostPaymentGuestAccessSecret())
    .update(buildPostPaymentGuestAccessPayload(input))
    .digest('hex')
}

export function isValidPostPaymentGuestAccessToken({
  token,
  ...input
}: PostPaymentGuestAccessTokenInput & {
  token: string
}): boolean {
  try {
    const expectedToken = createPostPaymentGuestAccessToken(input)
    const providedToken = token.trim()

    const expectedBuffer = Buffer.from(expectedToken, 'utf8')
    const providedBuffer = Buffer.from(providedToken, 'utf8')

    if (expectedBuffer.length !== providedBuffer.length) {
      return false
    }

    return timingSafeEqual(expectedBuffer, providedBuffer)
  } catch (error) {
    console.error('isValidPostPaymentGuestAccessToken error:', error)
    return false
  }
}
