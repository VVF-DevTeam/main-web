'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

interface CancelSubscriptionButtonProps {
  subscriptionId: string | null
  onSuccess?: () => void
}

export default function CancelSubscriptionButton({
  subscriptionId,
  onSuccess,
}: CancelSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return

    try {
      setIsLoading(true)
      await axios.post('/api/subscriptions/cancel', { subscriptionId })
      onSuccess?.()
    } catch (error) {
      console.error('Error canceling subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscriptionId) return null

  return (
    <button
      onClick={handleCancelSubscription}
      disabled={isLoading}
      className="mt-4 w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? t('canceling') : t('cancel-subscription')}
    </button>
  )
} 