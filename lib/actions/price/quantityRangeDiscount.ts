export const QUANTITY_RANGE_DISCOUNT_TYPE = 'Quantity Range Discount'

export type QuantityRangeRule = {
  type?: string
  minQuantity?: number | null
  maxQuantity?: number | null
  minDiscountPercent?: number | null
  maxDiscountPercent?: number | null
  /** Low-end percent, kept for list views that read discountAmount. */
  discountAmount?: number | null
}

export type QuantityRangeLinePrice = {
  percent: number
  unitPrice: number
  lineTotal: number
}

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value))

export const roundMoney = (value: number): number =>
  Math.round(value * 100) / 100

export const formatDiscountPercent = (value: number): string => {
  const rounded = Math.round(value * 100) / 100
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

export const isQuantityRangeDiscount = (
  discount: { type?: string } | null | undefined
): boolean => discount?.type === QUANTITY_RANGE_DISCOUNT_TYPE

const readPercent = (value: number | null | undefined): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

/**
 * Percent off one ticket at this quantity.
 * Below the minimum, the discount is 0. At and above the maximum, it stays at the high rate.
 * Between the two, it rises in even steps and is rounded to 2 decimal places.
 */
export const getQuantityRangePercent = (
  rule: QuantityRangeRule,
  quantity: number
): number => {
  const minQuantity = Math.round(Number(rule.minQuantity))
  const maxQuantity = Math.round(Number(rule.maxQuantity))
  const minPercent = readPercent(rule.minDiscountPercent ?? rule.discountAmount)
  const maxPercent = readPercent(rule.maxDiscountPercent)

  if (
    !Number.isInteger(minQuantity) ||
    !Number.isInteger(maxQuantity) ||
    minQuantity < 1 ||
    maxQuantity <= minQuantity ||
    !Number.isFinite(minPercent) ||
    !Number.isFinite(maxPercent)
  ) {
    return 0
  }

  const tickets = Math.floor(quantity)
  if (tickets < minQuantity) return 0
  if (tickets >= maxQuantity) return clampPercent(maxPercent)

  const span = maxQuantity - minQuantity
  const raw =
    minPercent + ((maxPercent - minPercent) * (tickets - minQuantity)) / span
  return clampPercent(Math.round(raw * 100) / 100)
}

/** Highest qualifying range percent. Multiple rules never stack with each other. */
export const getBestQuantityRangePercent = (
  discounts: QuantityRangeRule[],
  quantity: number
): number => {
  let best = 0
  for (const discount of discounts) {
    if (!isQuantityRangeDiscount(discount)) continue
    best = Math.max(best, getQuantityRangePercent(discount, quantity))
  }
  return best
}

/**
 * Unit and line price after the quantity-range discount.
 * Quantity is the number of this ticket the customer is buying, not a bundle size.
 */
export const priceLineAfterQuantityRange = (
  discounts: QuantityRangeRule[],
  quantity: number,
  identityUnitPrice: number
): QuantityRangeLinePrice => {
  const safeQuantity = Math.max(0, quantity)
  const percent = getBestQuantityRangePercent(discounts, safeQuantity)
  if (percent <= 0) {
    return {
      percent: 0,
      unitPrice: identityUnitPrice,
      lineTotal: identityUnitPrice * safeQuantity,
    }
  }

  const unitPrice = roundMoney(identityUnitPrice * (1 - percent / 100))
  return {
    percent,
    unitPrice,
    lineTotal: roundMoney(unitPrice * safeQuantity),
  }
}

export const quantityRangeSchedule = (
  rule: QuantityRangeRule
): Array<{ quantity: number; percent: number }> => {
  const minQuantity = Math.round(Number(rule.minQuantity))
  const maxQuantity = Math.round(Number(rule.maxQuantity))
  if (
    !Number.isInteger(minQuantity) ||
    !Number.isInteger(maxQuantity) ||
    maxQuantity <= minQuantity
  ) {
    return []
  }

  const schedule: Array<{ quantity: number; percent: number }> = []
  for (let quantity = minQuantity; quantity <= maxQuantity; quantity += 1) {
    schedule.push({
      quantity,
      percent: getQuantityRangePercent(rule, quantity),
    })
  }
  return schedule
}
