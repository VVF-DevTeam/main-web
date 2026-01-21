'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { verifyEventDiscountCode } from '@/lib/actions/event/verifyEventDiscountCode'
import Loader from '@/components/loader/Loader'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { EventTicket } from '@prisma/client'
import GuestInfoForm, { GuestInfo } from '@/components/payment/GuestInfoForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SelectedTicketWithQuantity } from './EventSingleCheckOut'
import { JsonValue } from '@prisma/client/runtime/library'

interface SelectedSeatWithTicket {
  seat: {
    ticketId: string | null
    ticketType: string | null
    status: number // SEAT_STATUS enum value
    name?: string
  }
  rowIndex: number
  seatIndex: number
  ticket: EventTicket
  price: number
  seatName: string
}

interface EventCartCheckoutProps {
  eventKeyName: string
  userId?: string | null
  eventId: string
  email: string
  type: string
  selectedSeatsWithTickets: SelectedSeatWithTicket[]
  seatsByTicketType: Map<string, SelectedSeatWithTicket[]>
  onClearCart: () => void
  onRemoveSeat: (rowIndex: number, seatIndex: number) => void
  selectedTickets?: SelectedTicketWithQuantity[] // Tickets selected from EventSingleCheckOut
  discounts: JsonValue
}

// Shape of discounts stored in event.eventDiscounts JSON field
interface EventDiscountJson {
  id?: string
  type?: string
  percentage?: number
  minQuantity?: number | null
  minTotal?: number | null
  code?: string | null
  cannotBeStacked?: boolean | null
}

type AppliedCodeDiscount = {
  code: string
  percentage: number
  cannotBeStacked: boolean
}

export default function EventCartCheckout({
  eventKeyName,
  userId,
  eventId,
  email,
  type,
  selectedSeatsWithTickets,
  seatsByTicketType,
  onClearCart,
  onRemoveSeat,
  selectedTickets = [],
  discounts = [],
}: EventCartCheckoutProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')

  // Check subscription status for member pricing
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDiscountsExpanded, setIsDiscountsExpanded] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [appliedCodeDiscount, setAppliedCodeDiscount] =
    useState<AppliedCodeDiscount | null>(null)
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)

  const isGuestCheckout = !userId || userId.trim() === ''

  // Normalize discounts JSON into a typed array for easier rendering
  const discountList: EventDiscountJson[] = useMemo(() => {
    if (Array.isArray(discounts)) {
      return discounts as EventDiscountJson[]
    }
    return []
  }, [discounts])

  const handleVerifyDiscountCode = useCallback(
    async (code: string) => {
      setIsVerifyingCode(true)
      try {
        const result = await verifyEventDiscountCode({
          eventId,
          code,
        })

        if (result.valid) {
          setAppliedCodeDiscount({
            code: result.code!,
            percentage: result.percentage!,
            cannotBeStacked: Boolean(result.cannotBeStacked),
          })
          toast.success('Discount code applied', {
            description: `Applied ${result.percentage}% off`,
            style: { color: '#22c55e' },
          })
        } else {
          setAppliedCodeDiscount(null)
          toast.error('Invalid discount code', {
            description: result.reason || 'The discount code is not valid. Please try again.',
            style: { color: '#ef4444' },
          })
        }
      } catch (error) {
        setAppliedCodeDiscount(null)
        toast.error('Something went wrong', {
          description: error instanceof Error
            ? error.message
            : 'Unable to verify discount code. Please try again.',
          style: { color: '#ef4444' },
        })
      } finally {
        setIsVerifyingCode(false)
        // Set cooldown: 30 seconds from now
        setCooldownEndTime(Date.now() + 30000)
      }
    },
    [eventId]
  )

  const handleRemoveCodeDiscount = useCallback(() => {
    setAppliedCodeDiscount(null)
    setDiscountCode('')
    toast.info('Discount code removed', {
      description: 'The discount code has been removed.',
      style: { color: '#3b82f6' },
    })
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchSubscription = async () => {
      try {
        if (userId) {
          const subscribed = await checkSubscription(userId)
          if (isMounted) {
            setIsSubscribed(Boolean(subscribed))
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        if (isMounted) {
          setIsLoadingSubscription(false)
        }
      }
    }
    fetchSubscription()
    return () => {
      isMounted = false
    }
  }, [userId])

  // Cooldown timer for discount code verification
  useEffect(() => {
    if (!cooldownEndTime) {
      setCooldownRemaining(0)
      return
    }

    const updateCooldown = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((cooldownEndTime - now) / 1000))
      setCooldownRemaining(remaining)
      
      if (remaining === 0) {
        setCooldownEndTime(null)
      }
    }

    // Update immediately
    updateCooldown()

    // Update every second
    const interval = setInterval(updateCooldown, 1000)

    return () => clearInterval(interval)
  }, [cooldownEndTime])

  // Calculate total price with all discounts applied
  const priceBreakdown = useMemo(() => {
    // Calculate base total (sum of all seat prices)
    const seatsTotal = selectedSeatsWithTickets.reduce(
      (sum, item) => sum + item.price,
      0
    )

    // Calculate total for selected tickets (non-seated)
    const ticketsTotal = selectedTickets.reduce((sum, item) => {
      const basePrice = Number(item.ticket.price) || 0
      const capacity = item.ticket.capacityPerTicket || 1
      let ticketPrice = basePrice * capacity

      // If payTotalNumber exists, this is a full course/event ticket
      if (item.ticket.payTotalNumber && item.ticket.payTotalNumber > 0) {
        ticketPrice = basePrice * capacity * item.ticket.payTotalNumber
      }

      return sum + (ticketPrice * item.quantity)
    }, 0)

    const baseTotal = seatsTotal + ticketsTotal

    // Apply membership discounts if subscribed
    let totalAfterMembership = baseTotal
    let membershipDiscountAmount = 0

    if (isSubscribed) {
      // Discount for seats
      selectedSeatsWithTickets.forEach((item) => {
        const discountPercent = item.ticket.discountMemberPercent || 0
        if (discountPercent > 0) {
          const discountAmount = item.price * (discountPercent / 100)
          membershipDiscountAmount += discountAmount
          totalAfterMembership -= discountAmount
        }
      })

      // Discount for tickets
      selectedTickets.forEach((item) => {
        const discountPercent = item.ticket.discountMemberPercent || 0
        if (discountPercent > 0) {
          const basePrice = Number(item.ticket.price) || 0
          const capacity = item.ticket.capacityPerTicket || 1
          let ticketPrice = basePrice * capacity

          if (item.ticket.payTotalNumber && item.ticket.payTotalNumber > 0) {
            ticketPrice = basePrice * capacity * item.ticket.payTotalNumber
          }

          const discountAmount = (ticketPrice * item.quantity) * (discountPercent / 100)
          membershipDiscountAmount += discountAmount
          totalAfterMembership -= discountAmount
        }
      })
    }

    // Apply event discounts with stacking rules
    let totalAfterBulk = totalAfterMembership
    let bulkDiscountAmount = 0
    let effectivePercent = 0

    if (discountList.length > 0) {
      const totalItemCount =
        selectedSeatsWithTickets.length +
        selectedTickets.reduce((sum, item) => sum + item.quantity, 0)

      // First, for each non‑code discount type, pick the single "best" qualifying discount:
      // - Bulk Discount: highest minQuantity (stricter condition)
      // - Minimum Total Discount: highest minTotal
      let bestBulk: EventDiscountJson | null = null
      let bestMinTotal: EventDiscountJson | null = null

      discountList.forEach((discount) => {
        const pct = discount.percentage ?? 0
        if (pct <= 0) return

        if (discount.type === 'Bulk Discount') {
          const minQty = discount.minQuantity ?? 0
          const qualifies = totalItemCount > minQty
          if (!qualifies) return

          if (!bestBulk || (bestBulk.minQuantity ?? 0) < minQty) {
            bestBulk = discount
          }
        } else if (discount.type === 'Minimum Total Discount') {
          const minTotal = discount.minTotal ?? 0
          const qualifies = totalAfterMembership >= minTotal
          if (!qualifies) return

          if (!bestMinTotal || (bestMinTotal.minTotal ?? 0) < minTotal) {
            bestMinTotal = discount
          }
        }
      })

      // Build the final list of qualifying non‑code discounts (at most one per type)
      const effectiveDiscounts: EventDiscountJson[] = []
      if (bestBulk) effectiveDiscounts.push(bestBulk)
      if (bestMinTotal) effectiveDiscounts.push(bestMinTotal)

      // Now apply stacking rules over these non‑code discounts:
      // Compute total stackable percentage and best non‑stackable percentage
      let stackablePercent = 0
      let bestNonStackablePercent = 0

      effectiveDiscounts.forEach((discount) => {
        const pct = discount.percentage ?? 0
        if (pct <= 0) return

        const isNonStackable = !!discount.cannotBeStacked

        if (isNonStackable) {
          // Track the best single non‑stackable discount
          bestNonStackablePercent = Math.max(bestNonStackablePercent, pct)
        } else {
          // Stack all stackable discounts
          stackablePercent += pct
        }
      })

      // Decide event percentage from non‑code discounts:
      // - If only stackable: use sum of stackable.
      // - If only non‑stackable: use best non‑stackable.
      // - If both: choose the larger of (stacked) vs (best non‑stackable).
      const nonCodePercent =
        stackablePercent > 0 && bestNonStackablePercent > 0
          ? Math.max(stackablePercent, bestNonStackablePercent)
          : stackablePercent > 0
            ? stackablePercent
            : bestNonStackablePercent
      effectivePercent = nonCodePercent

      // Track which discount is actually being used (for UI display)
      // If a non-stackable discount wins, only that one should show as green
      let isNonStackableWinning = bestNonStackablePercent > 0 &&
        (stackablePercent === 0 || bestNonStackablePercent >= stackablePercent)

      // Track if stackable discounts are winning (for UI display)
      const isStackableWinning = stackablePercent > 0 &&
        (bestNonStackablePercent === 0 || stackablePercent > bestNonStackablePercent)

      // Find the winning non-stackable discount if applicable
      let winningNonStackableDiscount: EventDiscountJson | null = null
      if (isNonStackableWinning) {
        // Find the non-stackable discount with the winning percentage
        winningNonStackableDiscount = effectiveDiscounts.find(
          (d) => !!d.cannotBeStacked && (d.percentage ?? 0) === bestNonStackablePercent
        ) || null
      }

      // Now incorporate the (possibly verified) Code Discount:
      // - If stackable: always add its percentage on top of non‑code percent.
      // - If non‑stackable: use whichever is larger between code percent and non‑code percent.
      let isCodeDiscountApplied = false
      let isCodeDiscountWinning = false
      if (appliedCodeDiscount && appliedCodeDiscount.percentage > 0) {
        const codePercent = appliedCodeDiscount.percentage
        if (appliedCodeDiscount.cannotBeStacked) {
          // Non‑stackable: pick the better of code vs non‑code
          if (codePercent > effectivePercent) {
            effectivePercent = codePercent
            isCodeDiscountApplied = true
            isCodeDiscountWinning = true
            // Code discount wins, so no non-code discount should show as green
            winningNonStackableDiscount = null
            // Update isNonStackableWinning to true since code discount is winning
            isNonStackableWinning = true
          } else {
            isCodeDiscountApplied = false
          }
        } else {
          // Stackable: always add on top of non‑code percent
          effectivePercent += codePercent
          isCodeDiscountApplied = true
        }
      }

      if (effectivePercent > 0) {
        bulkDiscountAmount =
          totalAfterMembership * (effectivePercent / 100)
        totalAfterBulk = totalAfterMembership - bulkDiscountAmount
      }

      return {
        baseTotal,
        totalAfterMembership,
        totalAfterBulk,
        membershipDiscountAmount,
        bulkDiscountAmount,
        finalTotal: totalAfterBulk,
        effectivePercent,
        isCodeDiscountApplied,
        isCodeDiscountWinning, // Track if code discount is winning (non-stackable)
        winningNonStackableDiscount, // Track which discount is actually winning
        isNonStackableWinning, // Track if a non-stackable discount is winning
        isStackableWinning, // Track if stackable discounts are winning
      }
    }

    return {
      baseTotal,
      totalAfterMembership,
      totalAfterBulk,
      membershipDiscountAmount,
      bulkDiscountAmount,
      finalTotal: totalAfterBulk,
      effectivePercent,
      isCodeDiscountApplied: false,
      isCodeDiscountWinning: false,
      winningNonStackableDiscount: null,
      isNonStackableWinning: false,
      isStackableWinning: false,
    }
  }, [
    selectedSeatsWithTickets,
    selectedTickets,
    isSubscribed,
    type,
    discounts,
    appliedCodeDiscount,
  ])

  // Master checkout handler for multiple ticket types
  const handleMasterCheckout = useCallback(async (guestInfo?: GuestInfo) => {
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
      // Prepare checkout items: group by ticket type with seat numbers
      const checkoutItems: Array<{
        ticketId: string
        stripePriceId: string
        stripeProductId: string
        seatNumbers: string[]
        eventTicketId: string
        quantity?: number // For non-seated tickets when seatNumbers is empty
      }> = []

      // Add seat-based tickets
      seatsByTicketType.forEach((seats) => {
        const ticket = seats[0].ticket
        const stripePriceIdForUser =
          isSubscribed && ticket.subscribedStripePriceId
            ? ticket.subscribedStripePriceId
            : ticket.stripePriceId

        if (stripePriceIdForUser && ticket.stripeProductId) {
          checkoutItems.push({
            ticketId: ticket.id,
            stripePriceId: stripePriceIdForUser,
            stripeProductId: ticket.stripeProductId,
            seatNumbers: seats.map((s) => s.seatName),
            eventTicketId: ticket.id,
          })
        }
      })

      // Add non-seated tickets with quantities
      selectedTickets.forEach((item) => {
        const ticket = item.ticket
        const stripePriceIdForUser =
          isSubscribed && ticket.subscribedStripePriceId
            ? ticket.subscribedStripePriceId
            : ticket.stripePriceId

        if (stripePriceIdForUser && ticket.stripeProductId && item.quantity >= 1) {
          // Non-seated tickets have empty seatNumbers array
          checkoutItems.push({
            ticketId: ticket.id,
            stripePriceId: stripePriceIdForUser,
            stripeProductId: ticket.stripeProductId,
            seatNumbers: [], // Empty for non-seated tickets
            eventTicketId: ticket.id,
            quantity: item.quantity, // Quantity for non-seated tickets
          })
        }
      })

      if (checkoutItems.length === 0) {
        toast.error('Error', {
          description: 'No valid tickets found for checkout.',
        })
        return
      }

      // Call API endpoint for multi-ticket checkout
      const { data } = await axiosInstance.post(
        '/api/payment/checkout-sessions/create-multi',
        {
          eventKeyName,
          userId: userId || '',
          eventId,
          type,
          email: guestInfo?.email || email,
          checkoutItems,
          // Only send the code - server will re-verify to prevent tampering
          ...(appliedCodeDiscount && {
            discountCode: appliedCodeDiscount.code,
          }),
          // Guest information (only if userId is not provided)
          ...(isGuestCheckout && guestInfo && {
            guestName: guestInfo.name,
            guestPhone: guestInfo.phone,
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
    seatsByTicketType,
    selectedTickets,
    isSubscribed,
    eventKeyName,
    userId,
    eventId,
    type,
    email,
    isGuestCheckout,
    appliedCodeDiscount,
  ])

  const handleCheckoutButtonClick = () => {
    if (isGuestCheckout) {
      setShowGuestForm(true)
    } else {
      handleMasterCheckout()
    }
  }

  const handleGuestFormSubmit = (info: GuestInfo) => {
    setShowGuestForm(false)
    handleMasterCheckout(info)
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="w-full">
        <h3 className="web_h3 mb-2 font-semibold text-gray-900">Cart</h3>
        <div className=" ">
          {/* Cart Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Cart ({selectedSeatsWithTickets.length + selectedTickets.reduce((sum, item) => sum + item.quantity, 0)} items)
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

          {/* Selected Seats List */}
          <div className="space-y-2">
            {selectedSeatsWithTickets.map((item) => {
              const basePrice = item.price
              const discountPercent = item.ticket.discountMemberPercent || 0
              const hasMemberDiscount =
                isSubscribed &&
                discountPercent > 0 &&
                item.ticket.discountMemberPercent != null

              // Calculate member price for this seat
              const memberPrice = hasMemberDiscount
                ? basePrice * ((100 - discountPercent) / 100)
                : basePrice

              const displayPrice = hasMemberDiscount ? memberPrice : basePrice
              const currency = item.ticket.currency || 'CAD'

              return (
                <div
                  key={`${item.rowIndex}-${item.seatIndex}`}
                  className="flex items-center justify-between rounded border bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {item.seatName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.ticket.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-0.5">
                      {hasMemberDiscount && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            {currency} ${basePrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            {discountPercent}% off
                          </span>
                        </>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {currency} ${displayPrice.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSeat(item.rowIndex, item.seatIndex)}
                      className="h-6 w-6 rounded p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Remove ${item.seatName}`}
                      disabled={isLoading}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Selected Tickets List (non-seated) */}
            {selectedTickets.map((item) => {
              const basePrice = Number(item.ticket.price) || 0
              const capacity = item.ticket.capacityPerTicket || 1
              let ticketPrice = basePrice * capacity

              // If payTotalNumber exists, this is a full course/event ticket
              if (item.ticket.payTotalNumber && item.ticket.payTotalNumber > 0) {
                ticketPrice = basePrice * capacity * item.ticket.payTotalNumber
              }

              const totalPrice = ticketPrice * item.quantity
              const discountPercent = item.ticket.discountMemberPercent || 0
              const hasMemberDiscount =
                isSubscribed &&
                discountPercent > 0 &&
                item.ticket.discountMemberPercent != null

              // Calculate member price
              const memberPrice = hasMemberDiscount
                ? totalPrice * ((100 - discountPercent) / 100)
                : totalPrice

              const displayPrice = hasMemberDiscount ? memberPrice : totalPrice
              const currency = item.ticket.currency || 'CAD'

              return (
                <div
                  key={item.ticket.id}
                  className="flex items-center justify-between rounded border bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {item.ticket.type} × {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-0.5">
                      {hasMemberDiscount && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            {currency} ${totalPrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            {discountPercent}% off
                          </span>
                        </>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {currency} ${displayPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Discount Information */}
          {(priceBreakdown.effectivePercent > 0 || discountList.length > 0) && (
            <div className="mt-4 space-y-2 rounded-md border border-green-200 bg-green-50 p-3">
              <h4 className="text-sm font-semibold text-green-900">
                Available Discounts
              </h4>
              <div className="space-y-1 text-xs text-gray-700">
                <p>
                  <strong>Effective discount:</strong>{' '}
                  {priceBreakdown.effectivePercent > 0
                    ? `${priceBreakdown.effectivePercent}% off applied`
                    : 'No discounts currently applied'}
                  {appliedCodeDiscount?.cannotBeStacked ?
                    priceBreakdown.isCodeDiscountApplied && (
                      <span className="text-xs text-gray-700">
                        {' '}from code discount (Your code discount is not stackable and larger than current discounts)
                      </span>
                    ) : priceBreakdown.isCodeDiscountApplied && (
                      <span className="text-xs text-gray-700">
                        {' '}({appliedCodeDiscount?.percentage}% off from code discount)
                      </span>
                    )
                  }
                </p>
              </div>

              {isDiscountsExpanded && (
                <div className="mt-2 space-y-3">
                  {discountList.length === 0 && (
                    <p className="text-xs text-gray-600">
                      No discounts available for this event.
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
                        .map((discount, index) => {
                          const key = discount.id || `bulk-${index}`
                          const percentage = discount.percentage ?? 0
                          const totalItemCount =
                            selectedSeatsWithTickets.length +
                            selectedTickets.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )
                          const minQty = discount.minQuantity ?? 0
                          const technicallyQualifies = totalItemCount > minQty

                          // Determine if this discount is actually applied:
                          // 1. If code discount (non-stackable) is winning: no bulk discount should be applied
                          // 2. If non-stackable discount is winning: only that specific discount
                          // 3. If stackable is winning: only stackable discounts
                          // 4. Otherwise: all qualifying discounts
                          const isActuallyApplied = technicallyQualifies &&
                            !priceBreakdown.isCodeDiscountWinning && // Code discount wins -> no bulk discount applied
                            (
                              // Case 1: Non-stackable is winning - only that specific one
                              (priceBreakdown.isNonStackableWinning && priceBreakdown.winningNonStackableDiscount?.id === discount.id) ||
                              // Case 2: Stackable is winning - only if this discount is stackable
                              (priceBreakdown.isStackableWinning && !discount.cannotBeStacked) ||
                              // Case 3: Neither is winning (shouldn't happen, but fallback)
                              (!priceBreakdown.isNonStackableWinning && !priceBreakdown.isStackableWinning)
                            )

                          // Check if a better discount is chosen:
                          // 1. If code discount (non-stackable) is winning
                          // 2. If non-stackable discount is winning and this isn't it
                          // 3. If stackable discounts are winning and this is non-stackable
                          const betterDiscountChosen = technicallyQualifies && !isActuallyApplied &&
                            (priceBreakdown.isCodeDiscountWinning ||
                              priceBreakdown.isNonStackableWinning ||
                              (priceBreakdown.isStackableWinning && discount.cannotBeStacked))

                          const needed = Math.max(
                            0,
                            minQty + 1 - totalItemCount
                          )

                          return (
                            <div
                              key={key}
                              className="flex items-start gap-2"
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${isActuallyApplied
                                  ? 'bg-green-200 text-green-900'
                                  : 'bg-gray-200 text-gray-500'
                                  }`}
                              >
                                {isActuallyApplied ? '✓' : '✗'}
                              </span>
                              <span
                                className={
                                  isActuallyApplied
                                    ? 'text-green-800 pt-1'
                                    : 'text-gray-600 pt-1'
                                }
                              >
                                <strong>
                                  {percentage}% off for more than {minQty} items
                                </strong>
                                {isActuallyApplied
                                  ? ` — currently applied (you have ${totalItemCount} items).`
                                  : betterDiscountChosen
                                    ? ` — better discount is chosen.`
                                    : needed > 0
                                      ? ` — add ${needed} more item${needed === 1 ? '' : 's'} to qualify.`
                                      : ` — add more items to qualify.`}
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
                          .map((discount, index) => {
                            const key = discount.id || `minTotal-${index}`
                            const percentage = discount.percentage ?? 0
                            const minTotal = discount.minTotal ?? 0
                            const cartTotal = priceBreakdown.totalAfterMembership
                            const technicallyQualifies = cartTotal >= minTotal

                            // Determine if this discount is actually applied:
                            // 1. If non-stackable is winning: only that specific discount
                            // 2. If stackable is winning: only stackable discounts
                            // 3. Otherwise: all qualifying discounts
                            const isActuallyApplied = technicallyQualifies &&
                              (
                                // Case 1: Non-stackable is winning - only that specific one
                                (priceBreakdown.isNonStackableWinning && priceBreakdown.winningNonStackableDiscount?.id === discount.id) ||
                                // Case 2: Stackable is winning - only if this discount is stackable
                                (priceBreakdown.isStackableWinning && !discount.cannotBeStacked) ||
                                // Case 3: Neither is winning (shouldn't happen, but fallback)
                                (!priceBreakdown.isNonStackableWinning && !priceBreakdown.isStackableWinning)
                              )

                            // Check if a better discount is chosen:
                            // 1. If non-stackable discount is winning and this isn't it
                            // 2. If stackable discounts are winning and this is non-stackable
                            const betterDiscountChosen = technicallyQualifies && !isActuallyApplied &&
                              (priceBreakdown.isNonStackableWinning ||
                                (priceBreakdown.isStackableWinning && discount.cannotBeStacked))

                            const needed = Math.max(
                              0,
                              minTotal - cartTotal
                            )

                            return (
                              <div
                                key={key}
                                className="flex items-start gap-2"
                              >
                                <span
                                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${isActuallyApplied
                                    ? 'bg-green-200 text-green-900'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                  {isActuallyApplied ? '✓' : '✗'}
                                </span>
                                <span
                                  className={
                                    isActuallyApplied
                                      ? 'text-green-800 pt-1'
                                      : 'text-gray-600 pt-1'
                                  }
                                >
                                  <strong>
                                    {percentage}% off for orders over $
                                    {minTotal.toFixed(2)}
                                  </strong>
                                  {' '}({discount.cannotBeStacked ? 'non-stackable' : 'stackable'})
                                  {isActuallyApplied
                                    ? ` — currently applied (your cart total is $${cartTotal.toFixed(2)}).`
                                    : betterDiscountChosen
                                      ? ` — better discount is chosen.`
                                      : ` — spend at least $${minTotal.toFixed(
                                        2
                                      )} to qualify${needed > 0
                                        ? ` (about $${needed.toFixed(
                                          2
                                        )} more).`
                                        : '.'
                                      }`}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    )}

                  {/* Code Discount entry moved to the price breakdown section */}
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
                      ? 'Hide discount details'
                      : 'Show discount details'}
                  </span>
                  <span
                    className={`transition-transform ${isDiscountsExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                  >
                    ▼
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Discount Code (only if event has Code Discount) */}
          <div className="flex items-center justify-between text-gray-600 border-t pt-4 mt-4">
            <span className="text-sm text-gray-600">Discount Code</span>
            <div className="flex w-[240px] items-center gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter Discount Code"
                className="h-8 w-full rounded border border-gray-300 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="button"
                size="sm"
                variant={appliedCodeDiscount ? 'destructive' : 'outline'}
                className={`h-8 text-xs ${appliedCodeDiscount ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => {
                  if (appliedCodeDiscount) {
                    handleRemoveCodeDiscount()
                    return
                  }
                  if (!discountCode.trim()) {
                    toast.error('Please enter a discount code.', {
                      description: 'The discount code is not valid. Please try again.',
                      style: {
                        color: '#ef4444',
                      },
                    })
                    return
                  }
                  handleVerifyDiscountCode(discountCode)
                }}
                disabled={isVerifyingCode || (cooldownRemaining > 0 && !appliedCodeDiscount)}
              >
                {isVerifyingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : appliedCodeDiscount ? (
                  'Remove'
                ) : cooldownRemaining > 0 ? (
                  `Wait ${cooldownRemaining}s`
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          </div>

          {appliedCodeDiscount && (
            <div className="flex items-center text-xs text-green-700">
              <span className={`pt-1 ${priceBreakdown.isCodeDiscountApplied ? 'text-green-700' : 'text-red-600'}`}>
                {priceBreakdown.isCodeDiscountApplied ? <span>
                  Code applied: <span className="font-semibold">{appliedCodeDiscount.code}</span>{' '}
                  ({appliedCodeDiscount.percentage}% off
                  {appliedCodeDiscount.cannotBeStacked ? ', non-stackable' : ''})
                </span> : <span>Not used (better discount applied above)</span>}
              </span>
            </div>
          )}


          {/* Total Price */}
          <div className="mt-4 space-y-2 border-t pt-4">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  {selectedSeatsWithTickets[0]?.ticket.currency || 'CAD'} $
                  {priceBreakdown.baseTotal.toFixed(2)}
                </span>
              </div>

              {/* Membership Discount */}
              {priceBreakdown.membershipDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Membership Discount</span>
                  <span>
                    -{selectedSeatsWithTickets[0]?.ticket.currency || 'CAD'} $
                    {priceBreakdown.membershipDiscountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Event Discounts (Bulk / Min Total / Code combined) */}
              {priceBreakdown.bulkDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>Event Discounts - {priceBreakdown.effectivePercent}% off</span>
                  <span>
                    -{selectedSeatsWithTickets[0]?.ticket.currency || 'CAD'} $
                    {priceBreakdown.bulkDiscountAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Final Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-primary">
                {selectedSeatsWithTickets[0]?.ticket.currency || 'CAD'} $
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
                disabled={
                  (selectedSeatsWithTickets.length === 0 && selectedTickets.length === 0) ||
                  isLoading
                }
              >
                {t('reserve-button')}{' '}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          {/* Guest Checkout Form Dialog */}
          {isGuestCheckout && (
            <Dialog open={showGuestForm} onOpenChange={setShowGuestForm}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('guest-checkout-title')}</DialogTitle>
                  <DialogDescription>
                    {t('guest-checkout-description')}
                  </DialogDescription>
                </DialogHeader>
                <GuestInfoForm
                  onSubmit={handleGuestFormSubmit}
                  initialEmail={email}
                  buttonText={t('reserve-button') || undefined}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  )
}
