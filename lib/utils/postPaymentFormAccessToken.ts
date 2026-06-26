import { createHmac, timingSafeEqual } from 'node:crypto'

type PostPaymentFormAccessTokenInput = {
  userId?: string | null
  paymentReference?: string | null
  eventKeyName: string
  guestEmail: string
}

type NormalizedTokenPayload = {
  userId: string | null
  paymentReference: string | null
  eventKeyName: string
  guestEmail: string
}

function normalizeOptionalValue(value?: string | null): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function normalizeGuestEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizePayload(
  input: PostPaymentFormAccessTokenInput
): NormalizedTokenPayload {
  return {
    userId: normalizeOptionalValue(input.userId),
    paymentReference: normalizeOptionalValue(input.paymentReference),
    eventKeyName: input.eventKeyName.trim(),
    guestEmail: normalizeGuestEmail(input.guestEmail),
  }
}

function getTokenSecret(): string | null {
  return process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || null
}

function toEncodedPayload(input: PostPaymentFormAccessTokenInput): string {
  return Buffer.from(JSON.stringify(normalizePayload(input))).toString('base64url')
}

function signEncodedPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

export function createPostPaymentFormAccessToken(
  input: PostPaymentFormAccessTokenInput
): string | null {
  const secret = getTokenSecret()

  if (!secret) {
    console.error(
      'Post-payment form access token secret is not configured; skipping guest form link generation.'
    )
    return null
  }

  const encodedPayload = toEncodedPayload(input)
  const signature = signEncodedPayload(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

export function verifyPostPaymentFormAccessToken({
  token,
  ...input
}: PostPaymentFormAccessTokenInput & {
  token?: string | null
}): boolean {
  const providedToken = token?.trim()

  if (!providedToken) {
    return false
  }

  const expectedToken = createPostPaymentFormAccessToken(input)

  if (!expectedToken) {
    return false
  }

  return timingSafeEqualString(providedToken, expectedToken)
}
