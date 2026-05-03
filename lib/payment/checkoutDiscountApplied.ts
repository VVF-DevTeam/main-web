import {
  getTicketUnitPrice,
  STUDENT_DISCOUNT_PERCENT,
} from '@/lib/price/getPrices'

/** One row per pricing or promo adjustment applied on checkout (stored in CheckoutSessionData.discountApplied). */
export type CheckoutAppliedDiscountRecord = {
  kind: 'membership' | 'student' | 'event_combined' | 'discount_code'
  ticketId?: string
  /** Member tier percent from EventTicket.discountMemberPercent */
  percentOff?: number
  /** Event-level fixed amount off subtotal (dollars), before proportional line split */
  fixedAmountOff?: number
  /** Event-level percent off subtotal (0–100) */
  eventPercentOff?: number
  /** Total dollars removed by event_combined (after % then fixed, matching checkout math) */
  totalDiscountDollars?: number
  /** Cart subtotal in dollars after member/student unit prices, before event discounts */
  preEventDiscountSubtotal?: number
  code?: string
  discountUnit?: 'percentage' | 'amount'
  /** Configured value for code rules (percent or currency amount depending on discountUnit) */
  configuredValue?: number
  cannotBeStacked?: boolean
  /**
   * List unit price in dollars before membership/student % off
   * ({@link getTicketUnitPrice}: base × capacity × payTotalNumber).
   */
  originalPrice?: number
}

/** Ticket fields needed to compute list unit price and member %. */
export type TicketDiscountFields = {
  id: string
  discountMemberPercent: number | null
  price: Parameters<typeof getTicketUnitPrice>[0]['price']
  capacityPerTicket?: number | null
  payTotalNumber?: number | null
}

export function buildAppliedDiscountsMulti(params: {
  checkoutItems: Array<{ ticketId: string }>
  ticketById: Map<string, TicketDiscountFields>
  pricingSubscribed: boolean
  useStudentPricing: boolean
  type: string
  shouldApplyDiscount: boolean
  effectivePercent: number
  effectiveAmount: number
  totalDiscountAmount: number
  totalAfterMembership: number
  verifiedCodeDiscount: {
    code: string
    discountAmount: number
    discountUnit: 'percentage' | 'amount'
    cannotBeStacked: boolean
  } | null
}): CheckoutAppliedDiscountRecord[] {
  const {
    checkoutItems,
    ticketById,
    pricingSubscribed,
    useStudentPricing,
    type,
    shouldApplyDiscount,
    effectivePercent,
    effectiveAmount,
    totalDiscountAmount,
    totalAfterMembership,
    verifiedCodeDiscount,
  } = params

  const out: CheckoutAppliedDiscountRecord[] = []

  if (type !== 'Membership' && pricingSubscribed) {
    const seen = new Set<string>()
    for (const item of checkoutItems) {
      const tid = item.ticketId
      if (seen.has(tid)) continue
      seen.add(tid)
      const t = ticketById.get(tid)
      const p = t?.discountMemberPercent
      if (!t || p == null || p <= 0) continue
      out.push({
        kind: 'membership',
        ticketId: tid,
        percentOff: p,
        originalPrice: getTicketUnitPrice(t),
      })
    }
  }

  if (type !== 'Membership' && useStudentPricing) {
    const seenSt = new Set<string>()
    for (const item of checkoutItems) {
      const tid = item.ticketId
      if (seenSt.has(tid)) continue
      seenSt.add(tid)
      const t = ticketById.get(tid)
      if (!t) continue
      out.push({
        kind: 'student',
        ticketId: tid,
        percentOff: STUDENT_DISCOUNT_PERCENT,
        originalPrice: getTicketUnitPrice(t),
      })
    }
  }

  if (
    type !== 'Membership' &&
    shouldApplyDiscount &&
    (effectivePercent > 0 || effectiveAmount > 0) &&
    totalDiscountAmount > 0
  ) {
    out.push({
      kind: 'event_combined',
      eventPercentOff: effectivePercent > 0 ? effectivePercent : undefined,
      fixedAmountOff: effectiveAmount > 0 ? effectiveAmount : undefined,
      totalDiscountDollars: totalDiscountAmount,
      preEventDiscountSubtotal: totalAfterMembership,
    })
  }

  if (verifiedCodeDiscount) {
    out.push({
      kind: 'discount_code',
      code: verifiedCodeDiscount.code,
      discountUnit: verifiedCodeDiscount.discountUnit,
      configuredValue: verifiedCodeDiscount.discountAmount,
      cannotBeStacked: verifiedCodeDiscount.cannotBeStacked,
    })
  }

  return out
}

export function buildAppliedDiscountsSingle(params: {
  dbTicket: TicketDiscountFields | null
  pricingSubscribed: boolean
  useStudentPricing: boolean
  type: string
}): CheckoutAppliedDiscountRecord[] {
  const { dbTicket, pricingSubscribed, useStudentPricing, type } = params
  const out: CheckoutAppliedDiscountRecord[] = []

  if (type === 'Membership') {
    return out
  }

  if (
    pricingSubscribed &&
    dbTicket &&
    dbTicket.discountMemberPercent != null &&
    dbTicket.discountMemberPercent > 0
  ) {
    const originalPrice = getTicketUnitPrice(dbTicket)
    out.push({
      kind: 'membership',
      ticketId: dbTicket.id,
      percentOff: dbTicket.discountMemberPercent,
      originalPrice,
    })
  }

  if (useStudentPricing && dbTicket) {
    out.push({
      kind: 'student',
      ticketId: dbTicket.id,
      percentOff: STUDENT_DISCOUNT_PERCENT,
      originalPrice: getTicketUnitPrice(dbTicket),
    })
  }

  return out
}
