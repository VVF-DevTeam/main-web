import { createHmac, timingSafeEqual } from 'node:crypto'

type PostPaymentFormAccessTokenInput = {
  paymentReference: string
  eventKeyName: string
  guestEmail: string
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function getPostPaymentFormSecret(): string {
  const secret =
    process.env.POST_PAYMENT_FORM_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim()

  if (!secret) {
    throw new Error('Missing post-payment form signing secret')
  }

  return secret
}

function buildTokenPayload({
  paymentReference,
  eventKeyName,
  guestEmail,
}: PostPaymentFormAccessTokenInput): string {
  return JSON.stringify({
    paymentReference: paymentReference.trim(),
    eventKeyName: eventKeyName.trim(),
    guestEmail: normalizeEmail(guestEmail),
  })
}

export function createPostPaymentFormAccessToken(
  input: PostPaymentFormAccessTokenInput
): string {
  return createHmac('sha256', getPostPaymentFormSecret())
    .update(buildTokenPayload(input))
    .digest('base64url')
}

export function verifyPostPaymentFormAccessToken({
  token,
  ...input
}: PostPaymentFormAccessTokenInput & {
  token?: string | null
}): boolean {
  if (!token?.trim()) {
    return false
  }

  const expectedToken = createPostPaymentFormAccessToken(input)
  const providedToken = token.trim()

  if (providedToken.length !== expectedToken.length) {
    return false
  }

  return timingSafeEqual(
    Buffer.from(providedToken, 'utf8'),
    Buffer.from(expectedToken, 'utf8')
  )
}
