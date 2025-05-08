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
}

export default function NormalCheckoutButton({
  stripePriceId,
  stripeProductId,
  eventKeyName,
  userId,
  eventId,
  buttonText,
  type,
}: NormalCheckoutButtonProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')

  const handleCheckout = async () => {
    const stripe = await stripePromise

    try {
      const { data } = await axiosInstance.post(
        '/api/payment/checkout-sessions/create',
        {
          stripePriceId: stripePriceId,
          stripeProductId: stripeProductId,
          eventKeyName: eventKeyName,
          userId: userId,
          eventId: eventId,
          type: type,
        }
      )
      const result = await stripe!.redirectToCheckout({ sessionId: data.id })

      if (result.error) {
        toast.error(`Stripe redirect error: ${result.error.message}`)
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            'A network or server error occurred. Please try again.'
        )
      } else if (error instanceof Error) {
        toast.error(error.message || 'Unexpected error occurred.')
      } else {
        toast.error('Unexpected error occurred. Please contact our developer team for support.')
      }
    }
  }

  return (
    <Button onClick={handleCheckout} variant="gray">
      {t(buttonText)}
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}
