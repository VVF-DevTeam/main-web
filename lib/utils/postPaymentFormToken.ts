import { createHmac, timingSafeEqual } from 'crypto'

type PostPaymentFormTokenInput = {
  userId?: string | null
  paymentReference?: string | null
  eventKeyName: string
  guestEmail: string
}

function getPostPaymentFormSecret(): string {
  const secret =
    process.env.AUTH_SECRET?.trim() ||
    process.env.SECRET_TRUST_CLIENT?.trim()

  if (!secret) {
    throw new Error(
      'Missing AUTH_SECRET or SECRET_TRUST_CLIENT for post-payment form tokens'
    )
  }

  return secret
}

function normalizeTokenPayload({
  userId,
  paymentReference,
  eventKeyName,
  guestEmail,
}: PostPaymentFormTokenInput) {
  return JSON.stringify({
    userId: userId?.trim() || '',
    paymentReference: paymentReference?.trim() || '',
    eventKeyName: eventKeyName.trim(),
    guestEmail: guestEmail.trim().toLowerCase(),
  })
}

export function createPostPaymentFormToken(
  input: PostPaymentFormTokenInput
): string {
  return createHmac('sha256', getPostPaymentFormSecret())
    .update(normalizeTokenPayload(input))
    .digest('hex')
}

export function verifyPostPaymentFormToken({
  token,
  ...input
}: PostPaymentFormTokenInput & { token?: string | null }): boolean {
  if (!token?.trim()) return false

  const expected = createPostPaymentFormToken(input)
  const providedBuffer = Buffer.from(token.trim(), 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')

  if (providedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(providedBuffer, expectedBuffer)
}
