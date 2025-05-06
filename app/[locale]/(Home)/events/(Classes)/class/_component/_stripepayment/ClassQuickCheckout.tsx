'use client'

import { useState } from 'react'
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

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

function CheckoutForm({ price, eventId }: { price: number; eventId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      const { data } = await axiosInstance.post('/api/payment/intents/create', {
        amount: Math.round(price * 100),
        eventId,
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
        Pay ${price}
      </Button>
    </form>
  )
}

export default function ClassQuickCheckout({
  price,
  eventId,
}: {
  price: number
  eventId: string
}) {
  return (
    <Elements stripe={stripePromise}>
      <p className="pb-2">
        Debit and Credit Card only. For other payment methods or paying for full
        course, please use normal checkout if this doesn&apos;t work.
      </p>
      <CheckoutForm price={price} eventId={eventId} />
    </Elements>
  )
}
