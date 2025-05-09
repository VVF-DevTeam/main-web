"use client"
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '../../../_component/_stripepayment/CheckoutFormTest'
import axios from 'axios'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [plan, setPlan] = useState<'monthly' | 'annually'>('monthly')
  const [price, setPrice] = useState<number | null>(null)

  const fetchClientSecret = async (planType: 'monthly' | 'annually') => {
    try {
      const res = await axios.post('/api/payment/intents/clientSecret', { plan: planType })
      setClientSecret(res.data.clientSecret)
      setPrice(res.data.price / 100)
    } catch (error) {
      console.error('Error fetching client secret:', error)
    }
  }

  useEffect(() => {
    fetchClientSecret(plan)
  }, [plan])

  const options = {
    clientSecret: clientSecret ?? '',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-4">
          <button 
            onClick={() => setPlan('monthly')} 
            className={`px-4 py-2 ${plan === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setPlan('annually')} 
            className={`px-4 py-2 ${plan === 'annually' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          >
            Annually
          </button>
        </div>
        <div className="mb-4">
          <p className="text-lg font-semibold">Price: {price ? `$${price}` : 'Loading...'}</p>
        </div>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm />
          </Elements>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage;
