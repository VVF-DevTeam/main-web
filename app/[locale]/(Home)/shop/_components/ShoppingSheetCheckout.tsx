'use client'

import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import Loader from '@/components/loader/Loader'
import { Button } from '@/components/ui/button'
import { ArrowRight, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { GuestInfo } from '@/components/payment/GuestInfoForm'
import { EventCheckoutDialog } from '@/components/payment/EventCheckoutDialog'
import { UserInfoProps } from '@/lib/types/userInfo'
import { JsonValue } from '@prisma/client/runtime/library'

// Shape of discounts stored in shop.shopDiscounts JSON field
interface ShopDiscountJson {
  id?: string
  type?: string
  discountAmount?: number
  discountUnit?: 'percentage' | 'amount'
  minQuantity?: number | null
  minTotal?: number | null
  code?: string | null
  cannotBeStacked?: boolean | null
}

type SelectedShopItem = {
  id: string
  title: string
  price: number | string
  currency: string
  stripePriceId: string
  stripeProductId: string
  quantity: number
  imageUrl?: string | null
  discountMemberPercent?: number | null
  subscribedStripePriceId?: string | null
}

interface ShoppingSheetCheckoutProps {
  shopSlug: string
  shopId: string
  selectedShopItems: SelectedShopItem[]
  onClearCart: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  userInfo?: UserInfoProps | null
  isSubscribed?: boolean
  discounts?: JsonValue
}

export default function ShoppingSheetCheckout({
  shopSlug,
  shopId,
  selectedShopItems,
  discounts = [],
  onClearCart,
  onRemoveItem,
  onUpdateQuantity,
  userInfo,
  isSubscribed = false,
}: ShoppingSheetCheckoutProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('shop')

  const [isLoadingSubscription] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [guestInfo, setGuestInfo] = useState<{ representativeGuest?: GuestInfo; otherGuests?: GuestInfo[] }>({})
  const [isDiscountsExpanded, setIsDiscountsExpanded] = useState(false)

  const userId = userInfo?.id || null
  const isGuestCheckout = !userId || userId.trim() === ''

  // Total item count
  const totalItemCount = selectedShopItems.reduce((sum, item) => sum + item.quantity, 0)

  // Normalize discounts JSON into a typed array for easier rendering/calculation
  const discountList: ShopDiscountJson[] = useMemo(() => {
    if (Array.isArray(discounts)) {
      return discounts as ShopDiscountJson[]
    }
    return []
  }, [discounts])

  // Helper to safely read discountAmount
  const getDiscountAmountValue = (d: ShopDiscountJson | null | undefined): number =>
    d && typeof d.discountAmount === 'number' ? d.discountAmount : 0

  // Calculate total price with membership & shop discounts applied
  const priceBreakdown = useMemo(() => {
    // Base total: sum of all cart item prices (before any discounts)
    let baseTotal = 0

    selectedShopItems.forEach((item) => {
      const numericPrice =
        typeof item.price === 'string' ? parseFloat(item.price) : item.price
      const safePrice = Number.isNaN(numericPrice) ? 0 : numericPrice

      const itemBaseTotal = safePrice * item.quantity
      baseTotal += itemBaseTotal
    })

    // Apply membership discounts (per‑item) if subscribed
    let membershipDiscountAmount = 0

    if (isSubscribed) {
      selectedShopItems.forEach((item) => {
        const numericPrice =
          typeof item.price === 'string' ? parseFloat(item.price) : item.price
        const safePrice = Number.isNaN(numericPrice) ? 0 : numericPrice

        const discountPercent = item.discountMemberPercent || 0
        if (discountPercent > 0) {
          const itemDiscount =
            safePrice * item.quantity * (discountPercent / 100)
          membershipDiscountAmount += itemDiscount
        }
      })
    }

    const totalAfterMembership = baseTotal - membershipDiscountAmount

    // Apply shop discounts (Bulk / Minimum Total) using a simplified version
    // of the EventCartCheckout stacking rules, but always based on subtotal (baseTotal)
    let bulkDiscountAmount = 0
    let effectivePercent = 0
    let effectiveAmount = 0

    if (discountList.length > 0) {
      // Pick the best qualifying percentage discount and amount discount
      let bestBulkPercent: ShopDiscountJson | null = null
      let bestMinTotalPercent: ShopDiscountJson | null = null
      let bestBulkAmount: ShopDiscountJson | null = null
      let bestMinTotalAmount: ShopDiscountJson | null = null

      discountList.forEach((discount) => {
        const value = discount.discountAmount ?? 0
        if (value <= 0) return

        const unit = discount.discountUnit ?? 'percentage'

        if (discount.type === 'Bulk Discount') {
          const minQty = discount.minQuantity ?? 0
          const qualifies = totalItemCount >= minQty
          if (!qualifies) return

          if (unit === 'amount') {
            if (!bestBulkAmount || (bestBulkAmount.minQuantity ?? 0) < minQty) {
              bestBulkAmount = discount
            }
          } else {
            if (
              !bestBulkPercent ||
              (bestBulkPercent.minQuantity ?? 0) < minQty
            ) {
              bestBulkPercent = discount
            }
          }
        } else if (discount.type === 'Minimum Total Discount') {
          const minTotal = discount.minTotal ?? 0
          const qualifies = baseTotal >= minTotal
          if (!qualifies) return

          if (unit === 'amount') {
            if (
              !bestMinTotalAmount ||
              (bestMinTotalAmount.minTotal ?? 0) < minTotal
            ) {
              bestMinTotalAmount = discount
            }
          } else {
            if (
              !bestMinTotalPercent ||
              (bestMinTotalPercent.minTotal ?? 0) < minTotal
            ) {
              bestMinTotalPercent = discount
            }
          }
        }
      })

      // For shops we simplify: choose ONE percentage discount and ONE amount discount,
      // then pick whichever saves more money on the cart total.
      const percentCandidate: ShopDiscountJson | null =
        getDiscountAmountValue(bestBulkPercent) >
        getDiscountAmountValue(bestMinTotalPercent)
          ? bestBulkPercent
          : bestMinTotalPercent

      const amountCandidate: ShopDiscountJson | null =
        getDiscountAmountValue(bestBulkAmount) >
        getDiscountAmountValue(bestMinTotalAmount)
          ? bestBulkAmount
          : bestMinTotalAmount

      const percentValue = getDiscountAmountValue(percentCandidate)
      const amountValue = getDiscountAmountValue(amountCandidate)

    // Compare approximate savings, based on subtotal (baseTotal)
    const percentSavings = baseTotal * (percentValue / 100)
      const amountSavings = amountValue

    if (percentSavings >= amountSavings && percentValue > 0) {
      effectivePercent = percentValue
      bulkDiscountAmount = percentSavings
    } else if (amountSavings > 0) {
      effectiveAmount = amountValue
      bulkDiscountAmount = amountSavings
    }
    }

    const totalAfterBulk = baseTotal - bulkDiscountAmount
    const finalTotal = Math.max(
      0,
      baseTotal - membershipDiscountAmount - bulkDiscountAmount
    )

    return {
      baseTotal,
      totalAfterMembership,
      totalAfterBulk,
      membershipDiscountAmount,
      bulkDiscountAmount,
      finalTotal,
      effectivePercent,
      effectiveAmount,
    }
  }, [selectedShopItems, isSubscribed, discountList, totalItemCount, getDiscountAmountValue])

  // Master checkout handler for multiple shop items
  const handleMasterCheckout = useCallback(async (
    representativeGuest?: GuestInfo,
    otherGuests?: GuestInfo[]
  ) => {
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
    if (!stripe) {
      toast.error('Error', {
        description: 'Stripe is not available. Please try again later.',
        style: {
          color: '#ef4444',
        },
      })
      return
    }

    try {
      setIsLoading(true)

      // Prepare checkout items
      const checkoutItems = selectedShopItems
        .map((item) => {
          const stripePriceIdToUse =
            isSubscribed && item.subscribedStripePriceId
              ? item.subscribedStripePriceId
              : item.stripePriceId

          return {
            shopItemId: item.id,
            stripePriceId: stripePriceIdToUse,
            stripeProductId: item.stripeProductId,
            quantity: item.quantity,
          }
        })
        .filter(
          (ci) =>
            ci.stripePriceId &&
            ci.stripeProductId &&
            ci.quantity >= 1
        )

      if (checkoutItems.length === 0) {
        toast.error('Error', {
          description: 'No valid items found for checkout.',
        })
        return
      }

      // Call API endpoint for multi-item shop checkout
      const { data } = await axiosInstance.post(
        '/api/payment/shop-checkout-sessions/create-multi',
        {
          shopSlug,
          userId: userId || '',
          shopId,
          mainEmail: representativeGuest?.email || userInfo?.email || '',
          checkoutItems,
          // Guest information (only if userId is not provided)
          ...(representativeGuest && {
            guestName: representativeGuest.name,
            guestPhone: representativeGuest.phone,
          }),
          // Other guests information
          ...(otherGuests && otherGuests.length > 0 && {
            otherGuestsInfo: otherGuests.map(guest => ({
              name: guest.name,
              email: guest.email,
              phone: guest.phone,
            })),
          }),
        }
      )

      const result = await stripe.redirectToCheckout({ sessionId: data.id })

      if (result.error) {
        toast.error('Error', {
          description: `Stripe redirect error: ${result.error.message}`,
        })
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error('Error', {
          description:
            error.response?.data?.message ||
            'A network or server error occurred. Please try again.',
        })
      } else if (error instanceof Error) {
        toast.error('Error', {
          description: error.message || 'Unexpected error occurred.',
        })
      } else {
        toast.error('Error', {
          description:
            'Unexpected error occurred. Please contact our developer team for support.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    selectedShopItems,
    shopSlug,
    userId,
    shopId,
    userInfo,
    isSubscribed,
  ])

  const handleCheckoutButtonClick = () => {
    // Show checkout dialog (will start with guest form)
    setShowCheckoutDialog(true)
  }

  const handleGuestFormSubmit = (guestInfo: {
    guestName: string
    guestEmail: string
    guestPhone: string
    otherGuests: Array<{ name: string; email: string; phone: string }>
  }) => {
    // Save guest info
    setGuestInfo({
      representativeGuest: {
        name: guestInfo.guestName,
        email: guestInfo.guestEmail,
        phone: guestInfo.guestPhone,
      },
      otherGuests: guestInfo.otherGuests,
    })
    
    // Shops don't have event forms, so proceed directly to checkout
    setShowCheckoutDialog(false)
    handleMasterCheckout(
      {
        name: guestInfo.guestName,
        email: guestInfo.guestEmail,
        phone: guestInfo.guestPhone,
      },
      guestInfo.otherGuests
    )
  }

  const handleEventFormSubmit = () => {
    // Shops don't have event forms, so this shouldn't be called
    // But if it is, proceed with saved guest info
    setShowCheckoutDialog(false)
    handleMasterCheckout(guestInfo.representativeGuest, guestInfo.otherGuests)
  }

  if (selectedShopItems.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {t('no-items-selected')}
      </p>
    )
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="w-full">
        <div className="pt-2">
          {/* Cart Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="web_h3 font-semibold text-gray-900">
              {t('cart', { count: totalItemCount })}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-sm text-red-600 hover:text-gray-700"
              disabled={isLoading}
            >
              {t('clear-all')}
            </Button>
          </div>

          {/* Selected Shop Items List */}
          <div className="space-y-0">
            {selectedShopItems.map((item, index) => {
              const numericPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
              const safePrice = Number.isNaN(numericPrice) ? 0 : numericPrice
              const totalPrice = safePrice * item.quantity
              const currency = item.currency || 'CAD'
              const discountPercent = item.discountMemberPercent || 0
              const hasMemberDiscount = isSubscribed && discountPercent > 0
              const memberTotalPrice = hasMemberDiscount
                ? safePrice * (1 - discountPercent / 100) * item.quantity
                : null

              const handleQuantityChange = (delta: number) => {
                const newQuantity = Math.max(0, item.quantity + delta)

                if (newQuantity === 0) {
                  onRemoveItem(item.id)
                  return
                }

                if (onUpdateQuantity) {
                  onUpdateQuantity(item.id, newQuantity)
                }
              }

              return (
                <div key={item.id}>
                  <div className="relative flex gap-4 bg-gray-900 p-4">
                    {/* Image on the left - fixed size */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content area - middle and right */}
                    <div className="flex flex-1 flex-col justify-between">
                      {/* Top row: Title and Remove link */}
                      <div className="flex items-start justify-between">
                        <h4 className="flex-1 text-sm font-medium text-white">
                          {item.title}
                        </h4>
                      </div>

                      {/* Bottom row: Quantity selector and Price */}
                      <div className="flex items-center justify-between">
                        {/* Quantity selector */}
                        <div className="flex items-center gap-2 rounded border border-gray-600 bg-gray-800">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(-1)}
                            className="h-8 w-8 rounded-l p-0 text-white hover:bg-gray-700"
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold text-white">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(1)}
                            className="h-8 w-8 rounded-r p-0 text-white hover:bg-gray-700"
                            disabled={isLoading}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price on the right */}
                        <div className="flex flex-col items-end gap-0.5">
                          {hasMemberDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                          {currency === 'VND' || currency === '₫'
                            ? `${totalPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}₫`
                            : `${currency} $${totalPrice.toFixed(2)}`}
                        </span>
                          )}
                          <span className={`text-sm font-semibold text-right ${hasMemberDiscount ? 'text-green-400' : 'text-white'}`}>
                            {currency === 'VND' || currency === '₫'
                              ? `${(hasMemberDiscount ? memberTotalPrice! : totalPrice).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}₫`
                              : `${currency} $${(hasMemberDiscount ? memberTotalPrice! : totalPrice).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gray dashed separator between items */}
                  {index < selectedShopItems.length - 1 && (
                    <div className="border-t border-gray-600" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Discount Information (shop-level discounts only, excludes membership) */}
          {(priceBreakdown.effectivePercent > 0 ||
            priceBreakdown.effectiveAmount > 0 ||
            discountList.length > 0) && (
            <div className="mt-4 space-y-2 rounded-md border border-green-200 bg-green-50 p-3">
              <h4 className="text-sm font-semibold text-green-900">
                {t('available-discounts')}
              </h4>
              <div className="space-y-1 text-xs text-gray-700">
                <p>
                  <strong>{t('effective-discount')}</strong>{' '}
                  {priceBreakdown.effectivePercent > 0 &&
                  priceBreakdown.effectiveAmount > 0 ? (
                    <>
                      {t('percent-off-applied', {
                        percent: priceBreakdown.effectivePercent,
                      })}{' '}
                      + $
                      {priceBreakdown.effectiveAmount.toFixed(2)} off
                    </>
                  ) : priceBreakdown.effectivePercent > 0 ? (
                    <>
                      {t('percent-off-applied', {
                        percent: priceBreakdown.effectivePercent,
                      })}
                    </>
                  ) : priceBreakdown.effectiveAmount > 0 ? (
                    <>${priceBreakdown.effectiveAmount.toFixed(2)} off</>
                  ) : (
                    <>{t('no-discounts-applied')}</>
                  )}
                </p>
              </div>

              {isDiscountsExpanded && (
                <div className="mt-2 space-y-3">
                  {discountList.length === 0 && (
                    <p className="text-xs text-gray-600">
                      No discounts available for this shop.
                    </p>
                  )}

                  {/* Bulk Discounts Group */}
                  {discountList.some((d) => d.type === 'Bulk Discount') && (
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-green-900">
                        Bulk Discounts
                      </p>
                      {discountList
                        .filter((d) => d.type === 'Bulk Discount')
                        .sort(
                          (a, b) =>
                            (a.discountAmount ?? 0) - (b.discountAmount ?? 0)
                        )
                        .map((discount, index) => {
                          const key = discount.id || `bulk-${index}`
                          const amount = discount.discountAmount ?? 0
                          const unit = discount.discountUnit ?? 'percentage'
                          const minQty = discount.minQuantity ?? 0
                          const qualifies = totalItemCount >= minQty

                          const isApplied =
                            qualifies &&
                            ((unit === 'percentage' &&
                              amount === priceBreakdown.effectivePercent) ||
                              (unit === 'amount' &&
                                amount === priceBreakdown.effectiveAmount))

                          const needed = Math.max(0, minQty - totalItemCount)

                          return (
                            <div
                              key={key}
                              className="flex items-start gap-2"
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                                  isApplied
                                    ? 'bg-green-200 text-green-900'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                              >
                                {isApplied ? '✓' : '✗'}
                              </span>
                              <span
                                className={
                                  isApplied
                                    ? 'text-green-800 pt-1'
                                    : 'text-gray-600 pt-1'
                                }
                              >
                                <strong>
                                  {unit === 'percentage'
                                    ? `${amount}% off when buying at least ${minQty} items`
                                    : `$${amount.toFixed(
                                        2
                                      )} off when buying at least ${minQty} items`}
                                </strong>
                                {isApplied
                                  ? ` (applied; you have ${totalItemCount} items)`
                                  : needed > 0
                                  ? ` (add ${needed} more item(s) to qualify)`
                                  : ' (not applied)'}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  )}

                  {/* Minimum Total Discounts Group */}
                  {discountList.some(
                    (d) => d.type === 'Minimum Total Discount'
                  ) && (
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-green-900">
                        Minimum Total Discounts
                      </p>
                      {discountList
                        .filter((d) => d.type === 'Minimum Total Discount')
                        .sort(
                          (a, b) =>
                            (a.discountAmount ?? 0) - (b.discountAmount ?? 0)
                        )
                        .map((discount, index) => {
                          const key = discount.id || `minTotal-${index}`
                          const amount = discount.discountAmount ?? 0
                          const unit = discount.discountUnit ?? 'percentage'
                          const minTotal = discount.minTotal ?? 0
                          const cartTotal = priceBreakdown.baseTotal
                          const qualifies = cartTotal >= minTotal

                          const isApplied =
                            qualifies &&
                            ((unit === 'percentage' &&
                              amount === priceBreakdown.effectivePercent) ||
                              (unit === 'amount' &&
                                amount === priceBreakdown.effectiveAmount))

                          const needed = Math.max(0, minTotal - cartTotal)

                          return (
                            <div
                              key={key}
                              className="flex items-start gap-2"
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                                  isApplied
                                    ? 'bg-green-200 text-green-900'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                              >
                                {isApplied ? '✓' : '✗'}
                              </span>
                              <span
                                className={
                                  isApplied
                                    ? 'text-green-800 pt-1'
                                    : 'text-gray-600 pt-1'
                                }
                              >
                                <strong>
                                  {unit === 'percentage'
                                    ? `${amount}% off for orders over $${minTotal.toFixed(
                                        2
                                      )}`
                                    : `$${amount.toFixed(
                                        2
                                      )} off for orders over $${minTotal.toFixed(
                                        2
                                      )}`}
                                </strong>
                                {isApplied
                                  ? ` (applied; cart total $${cartTotal.toFixed(
                                      2
                                    )})`
                                  : needed > 0
                                  ? ` (add $${needed.toFixed(
                                      2
                                    )} more to qualify)`
                                  : ' (not applied)'}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Expand / Collapse Toggle */}
              {discountList.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setIsDiscountsExpanded((prev) => !prev)
                  }
                  className="flex w-full items-center justify-center gap-1 text-xs font-medium text-green-800 hover:text-green-900"
                >
                  <span>
                    {isDiscountsExpanded
                      ? t('toggle-hide-discount-details')
                      : t('toggle-show-discount-details')}
                  </span>
                  <span
                    className={`transition-transform ${
                      isDiscountsExpanded ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    ▼
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Total Price */}
          <div className="mt-4 space-y-2 border-t pt-4">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>{t('checkout-subtotal')}</span>
                <span>
                  {selectedShopItems[0]?.currency || 'CAD'} $
                  {priceBreakdown.totalAfterMembership.toFixed(2)}
                </span>
              </div>

              {/* Shop Discounts (Bulk / Min Total combined) */}
              {priceBreakdown.bulkDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="max-w-[150px] md:max-w-[250px]">
                    {priceBreakdown.effectivePercent > 0 &&
                    priceBreakdown.effectiveAmount > 0 ? (
                      <>
                        Shop discounts: {priceBreakdown.effectivePercent}% off + $
                        {priceBreakdown.effectiveAmount.toFixed(2)} off
                      </>
                    ) : priceBreakdown.effectivePercent > 0 ? (
                      <>Shop discounts: {priceBreakdown.effectivePercent}% off</>
                    ) : (
                      <>
                        Shop discounts - $
                        {priceBreakdown.effectiveAmount.toFixed(2)} off
                      </>
                    )}
                  </span>
                  <span>
                    {(() => {
                      const currency = selectedShopItems[0]?.currency || 'CAD'
                      const flatAmount = priceBreakdown.effectiveAmount > 0
                        ? priceBreakdown.effectiveAmount
                        : 0

                      if (priceBreakdown.effectivePercent > 0 && flatAmount > 0) {
                        return (
                          <span className="whitespace-nowrap">
                            - (${priceBreakdown.totalAfterMembership.toFixed(2)} × {priceBreakdown.effectivePercent}% + ${flatAmount.toFixed(2)})
                          </span>
                        )
                      }
                      if (priceBreakdown.effectivePercent > 0) {
                        return (
                          <span className="whitespace-nowrap">
                            - ${priceBreakdown.totalAfterMembership.toFixed(2)} × {priceBreakdown.effectivePercent}%
                          </span>
                        )
                      }
                      return (
                        <span className="whitespace-nowrap">
                          -{currency} ${flatAmount.toFixed(2)}
                        </span>
                      )
                    })()}
                  </span>
                </div>
              )}
            </div>

            {/* Final Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-lg font-semibold text-gray-900">{t('checkout-total')}</span>
              <span className="text-xl font-bold text-primary">
                {selectedShopItems[0]?.currency || 'CAD'} $
                {priceBreakdown.finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Master Checkout Button */}
          <div className="mt-4">
            {!isLoadingSubscription && (
              <Button
                onClick={handleCheckoutButtonClick}
                className="group mt-4 w-full"
                disabled={selectedShopItems.length === 0 || isLoading}
              >
                {t('buy-button')}{' '}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          {/* Checkout Dialog - Only Guest Form (no event form for shops) */}
          <EventCheckoutDialog
            open={showCheckoutDialog}
            onOpenChange={setShowCheckoutDialog}
            onGuestFormSubmit={handleGuestFormSubmit}
            onEventFormSubmit={handleEventFormSubmit}
            totalGuestRequired={1} // Shops only require a single guest form
            userId={userId || null}
            userInfo={userInfo || null}
            isLoading={isLoading}
            t={t}
          />
        </div>
      </div>
    </>
  )
}

