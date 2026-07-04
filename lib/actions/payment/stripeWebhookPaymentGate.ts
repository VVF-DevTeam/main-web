import {
  CheckoutSessionStatus,
  PaymentType,
  type PrismaClient,
} from '@prisma/client'

export function shouldSkipDuplicateStripeSuccessEvent(
  eventType: string,
  metadata: Record<string, string> | null | undefined
): boolean {
  return (
    eventType === 'payment_intent.succeeded' &&
    Boolean(metadata?.checkoutDataId?.trim())
  )
}

export function shouldSkipInitialSubscriptionInvoice(
  eventType: string,
  billingReason: string | null | undefined
): boolean {
  return eventType === 'invoice.paid' && billingReason === 'subscription_create'
}

export type ClaimCheckoutSessionResult =
  | { action: 'proceed'; claimed: boolean }
  | { action: 'skip'; reason: 'already_processed' }

export async function claimCheckoutSessionForPayment(
  prisma: PrismaClient,
  checkoutDataId: string,
  stripePaymentId: string | null
): Promise<ClaimCheckoutSessionResult> {
  const existingSession = await prisma.checkoutSessionData.findUnique({
    where: { id: checkoutDataId },
    select: { status: true },
  })

  if (existingSession?.status === CheckoutSessionStatus.COMPLETED) {
    return { action: 'skip', reason: 'already_processed' }
  }

  const claimResult = await prisma.checkoutSessionData.updateMany({
    where: {
      id: checkoutDataId,
      status: CheckoutSessionStatus.PENDING,
    },
    data: { status: CheckoutSessionStatus.COMPLETED },
  })

  if (claimResult.count === 1) {
    return { action: 'proceed', claimed: true }
  }

  const refreshed = await prisma.checkoutSessionData.findUnique({
    where: { id: checkoutDataId },
    select: { status: true },
  })

  if (refreshed?.status === CheckoutSessionStatus.COMPLETED) {
    return { action: 'skip', reason: 'already_processed' }
  }

  if (
    stripePaymentId &&
    (await hasExistingStripeCheckoutPayments(prisma, stripePaymentId))
  ) {
    return { action: 'skip', reason: 'already_processed' }
  }

  return { action: 'proceed', claimed: false }
}

export async function hasExistingStripeCheckoutPayments(
  prisma: PrismaClient,
  stripePaymentId: string
): Promise<boolean> {
  const count = await prisma.payment.count({
    where: {
      stripePaymentId,
      type: { not: PaymentType.Refund },
    },
  })

  return count > 0
}

export async function rollbackCheckoutSessionClaim(
  prisma: PrismaClient,
  checkoutDataId: string
): Promise<void> {
  await prisma.checkoutSessionData.updateMany({
    where: {
      id: checkoutDataId,
      status: CheckoutSessionStatus.COMPLETED,
    },
    data: { status: CheckoutSessionStatus.PENDING },
  })
}
