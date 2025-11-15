'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { EventTicket } from '@prisma/client'

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

interface EventMultipleCheckoutProps {
  eventKeyName: string
  userId: string
  eventId: string
  email: string
  type: string
  selectedSeatsWithTickets: SelectedSeatWithTicket[]
  seatsByTicketType: Map<string, SelectedSeatWithTicket[]>
  onClearCart: () => void
  onRemoveSeat: (rowIndex: number, seatIndex: number) => void
}

export default function EventMultipleCheckout({
  eventKeyName,
  userId,
  eventId,
  email,
  type,
  selectedSeatsWithTickets,
  seatsByTicketType,
  onClearCart,
  onRemoveSeat,
}: EventMultipleCheckoutProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')

  // Check subscription status for member pricing
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchSubscription = async () => {
      try {
        const subscribed = await checkSubscription(userId)
        if (isMounted) {
          setIsSubscribed(Boolean(subscribed))
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        if (isMounted) {
          setIsLoadingSubscription(false)
        }
      }
    }
    if (userId) {
      fetchSubscription()
    }
    return () => {
      isMounted = false
    }
  }, [userId])

  // Calculate total price with all discounts applied
  const priceBreakdown = useMemo(() => {
    // Calculate base total (sum of all seat prices)
    const baseTotal = selectedSeatsWithTickets.reduce(
      (sum, item) => sum + item.price,
      0
    )

    // Apply membership discounts if subscribed
    let totalAfterMembership = baseTotal
    let membershipDiscountAmount = 0

    if (isSubscribed) {
      selectedSeatsWithTickets.forEach((item) => {
        const discountPercent = item.ticket.discountMemberPercent || 0
        if (discountPercent > 0) {
          const discountAmount = item.price * (discountPercent / 100)
          membershipDiscountAmount += discountAmount
          totalAfterMembership -= discountAmount
        }
      })
    }

    // Apply bulk discount (15% off) if 4+ items and not Membership
    let totalAfterBulk = totalAfterMembership
    let bulkDiscountAmount = 0
    const hasBulkDiscount =
      selectedSeatsWithTickets.length > 3 && type !== 'Membership'

    if (hasBulkDiscount) {
      bulkDiscountAmount = totalAfterMembership * 0.15
      totalAfterBulk = totalAfterMembership - bulkDiscountAmount
    }

    return {
      baseTotal,
      totalAfterMembership,
      totalAfterBulk,
      membershipDiscountAmount,
      bulkDiscountAmount,
      finalTotal: totalAfterBulk,
    }
  }, [selectedSeatsWithTickets, isSubscribed, type])

  // Master checkout handler for multiple ticket types
  const handleMasterCheckout = useCallback(async () => {
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
    if (!stripe) {
      toast.error('Error', {
        description: 'Stripe is not available. Please try again later.',
      })
      return
    }

    try {
      // Prepare checkout items: group by ticket type with seat numbers
      const checkoutItems: Array<{
        ticketId: string
        stripePriceId: string
        stripeProductId: string
        seatNumbers: string[]
        eventTicketId: string
      }> = []

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
          userId,
          eventId,
          type,
          email,
          checkoutItems,
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
    }
  }, [
    seatsByTicketType,
    isSubscribed,
    eventKeyName,
    userId,
    eventId,
    type,
    email,
  ])

  return (
    <div className="w-full">
      <h3 className="web_h3 mb-2 font-semibold text-gray-900">Cart</h3>
      <div className=" ">
        {/* Cart Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('selected-seats')} ({selectedSeatsWithTickets.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-sm text-red-600 hover:text-gray-700"
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
                  >
                    ×
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Discount Information */}
        <div className="mt-4 space-y-2 rounded-md border border-green-200 bg-green-50 p-3">
          <h4 className="text-sm font-semibold text-green-900">
            Available Discounts
          </h4>
          <div className="space-y-1.5">
            {/* Bulk Discount (3+ items) */}
            {selectedSeatsWithTickets.length > 3 && type !== 'Membership' ? (
              <div className="flex items-center gap-2 text-xs text-green-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-green-900">
                  ✓
                </span>
                <span>
                  <strong>Bulk Discount (15% off):</strong> Applied
                  automatically for 3+ items
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                  ✗
                </span>
                <span>
                  <strong>Bulk Discount (15% off):</strong> Add{' '}
                  {selectedSeatsWithTickets.length > 0
                    ? `${4 - selectedSeatsWithTickets.length} more item${
                        4 - selectedSeatsWithTickets.length === 1 ? '' : 's'
                      }`
                    : '4 items'}{' '}
                  to qualify
                </span>
              </div>
            )}
          </div>
        </div>

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

            {/* Bulk Discount */}
            {priceBreakdown.bulkDiscountAmount > 0 && (
              <div className="flex items-center justify-between text-green-600">
                <span>Bulk Discount (15% off)</span>
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
              onClick={handleMasterCheckout}
              className="group mt-4 w-full"
              disabled={selectedSeatsWithTickets.length === 0}
            >
              {t('reserve-button')}{' '}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
