'use client'

import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { axiosInstance } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { ArrowRight } from 'lucide-react'
import { PaymentType } from '@prisma/client'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface NormalCheckoutButtonProps {
  stripePriceId: string
  stripeProductId: string
  eventKeyName?: string
  userId: string
  eventId?: string
  buttonText: string
  type: PaymentType
  price?: number
  numberSession?: number
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
  price,
  numberSession,
  email,
  seatNumber,
  eventTicketId,
}: NormalCheckoutButtonProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(['event', 'membership'])

  const handleCheckout = async (priceId: string) => {
    const stripe = await stripePromise

    try {
      const { data } = await axiosInstance.post(
        '/api/payment/checkout-sessions/create',
        {
          stripePriceId: priceId,
          stripeProductId: stripeProductId,
          eventKeyName: eventKeyName,
          userId: userId,
          eventId: eventId,
          type: type,
          price: price,
          numberSession: numberSession,
          email: email,
          seatNumber: seatNumber,
          eventTicketId: eventTicketId,
        }
      )
      const result = await stripe!.redirectToCheckout({ sessionId: data.id })

      if (result.error) {
        toast.error('Error', {
          description: `Stripe redirect error: ${result.error.message}`,
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error('Error', {
          description: error.response?.data?.message ||
            'A network or server error occurred. Please try again.',
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      } else if (error instanceof Error) {
        toast.error('Error', {
          description: error.message || 'Unexpected error occurred.',
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      } else {
        toast.error('Error', {
          description: 'Unexpected error occurred. Please contact our developer team for support.',
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      }
    }
  }

  return (
    <div className="w-fit">
      <Button onClick={() => handleCheckout(stripePriceId)} className="group">
        {buttonText === 'become-member' ? t(`membership:${buttonText}`) : t(buttonText)}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Button>
    </div>
  )
}
