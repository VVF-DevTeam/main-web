'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import Loader from '@/components/loader/Loader'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { ArrowRight } from 'lucide-react'
import { PaymentType } from '@prisma/client'
import GuestInfoForm, { GuestInfo } from './GuestInfoForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface NormalCheckoutButtonProps {
  stripePriceId: string
  stripeProductId: string
  eventKeyName?: string
  userId?: string | null
  eventId?: string
  buttonText: string
  type: PaymentType
  numberSession?: number | null
  email: string
  seatNumber?: string
  eventTicketId?: string
}

export default function NormalCheckoutButton({
  stripePriceId,
  stripeProductId,
  eventKeyName,
  userId,
  eventId,
  buttonText,
  type,
  numberSession,
  email,
  seatNumber,
  eventTicketId,
}: NormalCheckoutButtonProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(['event', 'membership'])
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isGuestCheckout = !userId || userId.trim() === ''

  const handleCheckout = async (priceId: string, guestInfo?: GuestInfo) => {
    const stripe = await stripePromise

    try {
      setIsLoading(true)
      const { data } = await axiosInstance.post(
        '/api/payment/checkout-sessions/create',
        {
          stripePriceId: priceId,
          stripeProductId: stripeProductId,
          eventKeyName: eventKeyName,
          userId: userId || '',
          eventId: eventId,
          type: type,
          numberSession: numberSession,
          email: guestInfo?.email || email,
          seatNumber: seatNumber,
          eventTicketId: eventTicketId,
          // Guest information (only if userId is not provided)
          ...(isGuestCheckout &&
            guestInfo && {
              guestName: guestInfo.name,
              guestPhone: guestInfo.phone,
            }),
        }
      )
      const result = await stripe!.redirectToCheckout({ sessionId: data.id })

      if (result.error) {
        toast.error('Error', {
          description: `Stripe redirect error: ${result.error.message}`,
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error('Error', {
          description:
            error.response?.data?.message ||
            'A network or server error occurred. Please try again.',
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      } else if (error instanceof Error) {
        toast.error('Error', {
          description: error.message || 'Unexpected error occurred.',
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      } else {
        toast.error('Error', {
          description:
            'Unexpected error occurred. Please contact our developer team for support.',
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    if (isGuestCheckout) {
      // Show guest form dialog
      setShowGuestForm(true)
    } else {
      // Proceed directly to checkout
      handleCheckout(stripePriceId)
    }
  }

  const handleGuestFormSubmit = (info: GuestInfo) => {
    setShowGuestForm(false)
    handleCheckout(stripePriceId, info)
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="w-fit">
        <Button onClick={handleButtonClick} className="group" disabled={isLoading} size="sm">
          {buttonText === 'become-member'
            ? t(`membership:${buttonText}`)
            : t(buttonText)}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>

      {isGuestCheckout && (
        <Dialog open={showGuestForm} onOpenChange={setShowGuestForm}>
          <DialogContent className="bg-bgColor-white w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-[425px] sm:w-auto sm:mx-auto rounded-md">
            <DialogHeader>
              <DialogTitle>{t('event:guest-checkout-title')}</DialogTitle>
              <DialogDescription>
                {t('event:guest-checkout-description-with-login')}{' '}
                <Link href="/signIn" className="text-blue-500 hover:text-blue-600 hover:underline">
                  {t('event:guest-checkout-login-link')}
                </Link>{' '}
                {t('event:guest-checkout-login-text')}
              </DialogDescription>
            </DialogHeader>
            <GuestInfoForm
              onSubmit={handleGuestFormSubmit}
              initialEmail={email}
              buttonText={
                buttonText === 'become-member'
                  ? (t(`membership:${buttonText}`) || undefined)
                  : (t(buttonText) || undefined)
              }
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
