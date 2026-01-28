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

interface SingleCheckoutButtonProps {
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
  mainUserPhone?: string
  mainUserName?: string
}

export default function SingleCheckoutButton({
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
  mainUserPhone = '',
  mainUserName = '',
}: SingleCheckoutButtonProps) {
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
          // Guest information - always send if provided from form
          // For logged-in users, this allows them to review/confirm their info
          // For guest users, this is required information
          ...(guestInfo && {
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
    // Always show guest form so users can review their information
    setShowGuestForm(true)
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

      {/* Guest Checkout Form Dialog - Always shown for review */}
      <Dialog open={showGuestForm} onOpenChange={setShowGuestForm}>
        <DialogContent className="bg-bgColor-white w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-[500px] sm:w-auto sm:mx-auto rounded-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('guest-checkout-title')}</DialogTitle>
            <DialogDescription>
              {t('checkout-description-first-line')}
              {userId ? (
                // Logged in user
                <>
                  {' '}{t('checkout-description-first-form-filled')}{' '}
                  <Link href={`/profile/${userId}`} className="text-blue-500 hover:text-blue-600 underline">
                    {t('checkout-profile-link')}
                  </Link>
                  . {t('checkout-fill-empty-fields')}
                </>
              ) : (
                // Guest user
                <>
                  {' '}{t('more-over-encouraged')}{' '}
                  <Link href="/signIn" className="text-blue-500 hover:text-blue-600 underline">
                    {t('guest-checkout-login-link')}
                  </Link>{' '}
                  {t('guest-checkout-login-text')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <GuestInfoForm
            onSubmit={handleGuestFormSubmit}
            mainUserEmail={email}
            mainUserPhone={mainUserPhone}
            mainUserName={mainUserName}
            userId={userId}
            buttonText={
              buttonText === 'become-member'
                ? (t(`membership:${buttonText}`) || undefined)
                : (t(buttonText) || undefined)
            }
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
