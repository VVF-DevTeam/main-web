import { describe, expect, test } from 'vitest'
import {
  getQuantityRangePercent,
  priceLineAfterQuantityRange,
  QUANTITY_RANGE_DISCOUNT_TYPE,
} from './quantityRangeDiscount'

const rule = {
  type: QUANTITY_RANGE_DISCOUNT_TYPE,
  minQuantity: 2,
  minDiscountPercent: 5,
  maxQuantity: 10,
  maxDiscountPercent: 20,
}

describe('quantity range discount', () => {
  test('stays at full price below the minimum and caps at the maximum', () => {
    expect(getQuantityRangePercent(rule, 1)).toBe(0)
    expect(getQuantityRangePercent(rule, 2)).toBe(5)
    expect(getQuantityRangePercent(rule, 10)).toBe(20)
    expect(getQuantityRangePercent(rule, 14)).toBe(20)
  })

  test('rises evenly between the two ticket counts', () => {
    // (20 - 5) / (10 - 2) = 1.875 points per extra ticket
    expect(getQuantityRangePercent(rule, 3)).toBe(6.88)
    expect(getQuantityRangePercent(rule, 6)).toBe(12.5)
    expect(getQuantityRangePercent(rule, 9)).toBe(18.13)
  })

  test('discounts each ticket at the rate for that quantity', () => {
    const three = priceLineAfterQuantityRange([rule], 3, 100)
    expect(three.percent).toBe(6.88)
    expect(three.unitPrice).toBe(93.12)
    expect(three.lineTotal).toBe(279.36)

    const ten = priceLineAfterQuantityRange([rule], 10, 100)
    expect(ten.unitPrice).toBe(80)
    expect(ten.lineTotal).toBe(800)
  })

  test('keeps the full unit price when the quantity does not qualify', () => {
    const one = priceLineAfterQuantityRange([rule], 1, 25.5)
    expect(one.percent).toBe(0)
    expect(one.unitPrice).toBe(25.5)
    expect(one.lineTotal).toBe(25.5)
  })
})
