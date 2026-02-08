'use server'

import { prisma } from '@/lib/db'

type EventCodeDiscount = {
  code?: string | null
  // New format
  discountAmount?: number | null
  discountUnit?: 'percentage' | 'amount' | null
  // Legacy field for backward compatibility
  percentage?: number | null
  cannotBeStacked?: boolean | null
  type?: string
}

export type VerifiedEventCodeDiscount =
  | {
      valid: true
      code: string
      discountAmount: number
      discountUnit: 'percentage' | 'amount'
      cannotBeStacked: boolean
    }
  | {
      valid: false
      reason: 'Event not found' | 'No code discounts found' | 'Invalid code'
    }

export async function verifyEventDiscountCode(params: {
  eventId: string
  code: string
}): Promise<VerifiedEventCodeDiscount> {
  const code = params.code.trim()
  if (!code) {
    return { valid: false, reason: 'Invalid code' }
  }

  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
    select: { eventCodeDiscounts: true },
  })

  if (!event) return { valid: false, reason: 'Event not found' }
  if (!event.eventCodeDiscounts || !Array.isArray(event.eventCodeDiscounts)) {
    return { valid: false, reason: 'No code discounts found' }
  }

  const normalized = code.toLowerCase()
  const match = (event.eventCodeDiscounts as unknown as EventCodeDiscount[]).find(
    (d) => (d?.code ?? '').toString().trim().toLowerCase() === normalized
  )

  if (!match) return { valid: false, reason: 'Invalid code' }

  // Support new JSON format (discountAmount + discountUnit) with
  // backward compatibility for legacy `percentage` field.
  const rawAmount =
    match.discountAmount !== undefined && match.discountAmount !== null
      ? match.discountAmount
      : match.percentage ?? 0

  const unit = (match.discountUnit ?? 'percentage') as
    | 'percentage'
    | 'amount'

  if (unit !== 'percentage' && unit !== 'amount') {
    return { valid: false, reason: 'Invalid code' }
  }

  const discountAmount = Number(rawAmount ?? 0)
  if (!Number.isFinite(discountAmount) || discountAmount <= 0) {
    return { valid: false, reason: 'Invalid code' }
  }

  return {
    valid: true,
    code,
    discountAmount,
    discountUnit: unit,
    cannotBeStacked: Boolean(match.cannotBeStacked),
  }
}


