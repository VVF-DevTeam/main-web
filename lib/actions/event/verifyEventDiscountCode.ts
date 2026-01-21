'use server'

import { prisma } from '@/lib/db'

type EventCodeDiscount = {
  code?: string | null
  percentage?: number | null
  cannotBeStacked?: boolean | null
  type?: string
}

export type VerifiedEventCodeDiscount =
  | {
      valid: true
      code: string
      percentage: number
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

  const percentage = Number(match.percentage ?? 0)
  if (!Number.isFinite(percentage) || percentage <= 0) {
    return { valid: false, reason: 'Invalid code' }
  }

  return {
    valid: true,
    code,
    percentage,
    cannotBeStacked: Boolean(match.cannotBeStacked),
  }
}


