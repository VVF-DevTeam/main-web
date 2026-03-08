'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import Loader from '@/components/loader/Loader'
import { Button } from '@/components/ui/button'
import { ArrowRight, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { GuestInfo } from '@/components/payment/GuestInfoForm'
import { EventCheckoutDialog } from '@/components/payment/EventCheckoutDialog'
import { UserInfoProps } from '@/lib/types/userInfo'

type SelectedShopItem = {
  id: string
  title: string
  price: number | string
  currency: string
  stripePriceId: string
  stripeProductId: string
  quantity: number
  imageUrl?: string | null
}

interface ShoppingSheetCheckoutProps {
  shopSlug: string
  shopId: string
  selectedShopItems: SelectedShopItem[]
  onClearCart: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateQuantity?: (itemId: string, quantity: number) => void
  userInfo?: UserInfoProps | null
}

export default function ShoppingSheetCheckout({
  shopSlug,
  shopId,
  selectedShopItems,
  onClearCart,
  onRemoveItem,
  onUpdateQuantity,
  userInfo,
}: ShoppingSheetCheckoutProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('shop')

  // Check subscription status for member pricing (if shops support it)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [guestInfo, setGuestInfo] = useState<{ representativeGuest?: GuestInfo; otherGuests?: GuestInfo[] }>({})

  const userId = userInfo?.id || null
  const isGuestCheckout = !userId || userId.trim() === ''

  // Total item count
  const totalItemCount = selectedShopItems.reduce((sum, item) => sum + item.quantity, 0)

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

  // Calculate total price
  const priceBreakdown = useMemo(() => {
    const baseTotal = selectedShopItems.reduce((sum, item) => {
      const numericPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price
      const safePrice = Number.isNaN(numericPrice) ? 0 : numericPrice
      return sum + safePrice * item.quantity
    }, 0)

    // For now, no discounts for shops
    // If shops get member discounts later, add them here

    return {
      baseTotal,
      finalTotal: baseTotal,
    }
  }, [selectedShopItems])

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
        .filter((item) => item.stripePriceId && item.stripeProductId && item.quantity >= 1)
        .map((item) => ({
          shopItemId: item.id,
          stripePriceId: item.stripePriceId,
          stripeProductId: item.stripeProductId,
          quantity: item.quantity,
        }))

      if (checkoutItems.length === 0) {
        toast.error('Error', {
          description: 'No valid items found for checkout.',
        })
        return
      }

      // Call API endpoint for multi-item shop checkout
      // Note: This endpoint may need to be created if it doesn't exist
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

              const handleQuantityChange = (delta: number) => {
                if (onUpdateQuantity) {
                  const newQuantity = Math.max(1, item.quantity + delta)
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
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-sm text-white underline hover:text-gray-300"
                          disabled={isLoading}
                        >
                          {t('remove') || 'Remove'}
                        </button>
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
                            disabled={isLoading || item.quantity <= 1}
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
                        <span className="text-sm font-semibold text-white text-right">
                          {currency === 'VND' || currency === '₫'
                            ? `${totalPrice.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}₫`
                            : `${currency} $${totalPrice.toFixed(2)}`}
                        </span>
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

          {/* Total Price */}
          <div className="mt-4 space-y-2 border-t pt-4">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>{t('checkout-subtotal')}</span>
                <span>
                  {selectedShopItems[0]?.currency || 'CAD'} $
                  {priceBreakdown.baseTotal.toFixed(2)}
                </span>
              </div>
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
                {t('reserve-button')}{' '}
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

