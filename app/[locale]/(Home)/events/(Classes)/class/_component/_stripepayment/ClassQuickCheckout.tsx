'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { axiosInstance } from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { PaymentType } from '@prisma/client'
interface CheckoutFormProps {
  price: number
  classId: string
  userId: string
  stripePriceId: string
  stripeProductId: string
  type: PaymentType
}

interface QuickCheckoutFormProps {
  price: number
  classId: string
  userId: string
  stripePriceId: string
  stripeProductId: string
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

function QuickCheckoutForm({
  price,
  classId,
  userId,
  stripePriceId,
  stripeProductId,
  type,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Check if the user is subscribed to the class and get remaining sessions
  useEffect(() => {
    const checkSubAndSessions = async () => {
      try {
        const [subResult] = await Promise.all([
          checkSubscription(userId),
        ])
        setIsSubscribed(subResult)
        // Calculate full course price with 50% discount, and additional 20% if subscribed
      } catch (error) {
        console.error('Error checking subscription or sessions:', error)
      }
    }
    checkSubAndSessions()
  }, [userId, classId, price])  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      const { data } = await axiosInstance.post('/api/payment/intents/create', {
        amount: isSubscribed ? price * 0.8 * 100 : price * 100,
        classId,
        userId,
        stripePriceId,
        stripeProductId,
        type: type,
      })

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Payment failed',
          description: result.error.message,
        })
      } else if (result.paymentIntent?.status === 'succeeded') {
        router.push(`${pathname}/payment/success`)
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred'

      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="rounded-md border border-gray-300 bg-white p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                  color: '#a0aec0',
                },
              },
              invalid: {
                color: '#e53e3e',
              },
            },
          }}
        />
      </div>
      <Button type="submit" disabled={!stripe || loading}>
        Pay ${isSubscribed ? price * 0.8 : price}
      </Button>
    </form>
  )
}

export default function ClassQuickCheckout({
  price,
  classId,
  userId,
  stripePriceId,
  stripeProductId,
}: QuickCheckoutFormProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')

  return (
    <Elements stripe={stripePromise}>
      <p className="pb-2">{t('quick-checkout-description')}</p>
      <QuickCheckoutForm
        price={price}
        classId={classId}
        userId={userId}
        stripePriceId={stripePriceId}
        stripeProductId={stripeProductId}
        type="Class"
      />
    </Elements>
  )
}
