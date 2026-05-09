type NumericLike = number | string | null | undefined | { toString(): string }

type TicketPriceLike = {
  price: NumericLike
  capacityPerTicket?: number | null
  payTotalNumber?: number | null
  discountMemberPercent?: number | null
}

type FinalTicketPriceOptions = {
  isSubscribed?: boolean
  hasActiveStudentDiscount?: boolean
  quantity?: number
  overrideUnitPrice?: number
}

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value))

const toNumber = (value: NumericLike): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Price for one purchasable ticket unit before membership/student discounts.
 * Includes capacity and full-course multipliers.
 */
export const getTicketUnitPrice = (ticket: TicketPriceLike): number => {
  const basePrice = toNumber(ticket.price)
  const capacity = ticket.capacityPerTicket ?? 1
  const totalNumber = ticket.payTotalNumber && ticket.payTotalNumber > 0
    ? ticket.payTotalNumber
    : 1

  return basePrice * capacity * totalNumber
}

export const getMemberDiscountPercent = (
  ticket: Pick<TicketPriceLike, 'discountMemberPercent'>
): number => {
  if (ticket.discountMemberPercent == null) {
    return 0
  }
  return clampPercent(ticket.discountMemberPercent)
}

export const applyPercentageDiscount = (price: number, discountPercent: number): number => {
  const validPercent = clampPercent(discountPercent)
  return price * ((100 - validPercent) / 100)
}

/** Student percent off list price when applied (additive with member %). */
export const STUDENT_DISCOUNT_PERCENT = 18

/**
 * Total percent off list/unit price: member % (if any) plus student % (if any),
 * capped at 100%. Matches {@link getFinalTicketPrice}.
 */
export const getCombinedMemberStudentPercentOff = (
  hasMemberDiscount: boolean,
  memberDiscountPercent: number,
  hasActiveStudentDiscount: boolean
): number => {
  let sum = 0
  if (hasMemberDiscount) sum += clampPercent(memberDiscountPercent)
  if (hasActiveStudentDiscount) sum += STUDENT_DISCOUNT_PERCENT
  return clampPercent(sum)
}

/**
 * Final ticket price: list unit price × (1 − (member% + student%) / 100), then × quantity.
 * Member and student discounts apply to the same base (additive percents, capped at 100%).
 */
export const getFinalTicketPrice = (
  ticket: TicketPriceLike,
  options: FinalTicketPriceOptions = {}
): number => {
  const {
    isSubscribed = false,
    hasActiveStudentDiscount = false,
    quantity = 1,
    overrideUnitPrice,
  } = options

  const baseUnitPrice = overrideUnitPrice ?? getTicketUnitPrice(ticket)
  const combinedPercent = clampPercent(
    (isSubscribed ? getMemberDiscountPercent(ticket) : 0) +
    (hasActiveStudentDiscount ? STUDENT_DISCOUNT_PERCENT : 0)
  )
  const unitAfterDiscounts = applyPercentageDiscount(baseUnitPrice, combinedPercent)

  return unitAfterDiscounts * Math.max(0, quantity)
}
