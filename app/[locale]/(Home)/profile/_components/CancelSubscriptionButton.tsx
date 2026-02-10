'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { axiosInstance } from '@/lib/axios'
import { getSubscriptionStatus } from '@/lib/actions/subscription/getSubscriptionStatus'
import Loader from '@/components/loader/Loader'
interface CancelSubscriptionButtonProps {
  subscriptionId: string | null
}

export default function CancelSubscriptionButton({
  subscriptionId,
}: CancelSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScheduledForCancellation, setIsScheduledForCancellation] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')

  const fetchSubscriptionStatus = async () => {
    if (!subscriptionId) {
      setIsInitialLoading(false)
      return
    }
    
    try {
      const status = await getSubscriptionStatus(subscriptionId)
      if (status) {
        setIsScheduledForCancellation(status.cancel_at_period_end)
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [subscriptionId])

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return

    try {
      setIsLoading(true)
      const response = await axiosInstance.post('/api/subscriptions/cancel', { subscriptionId })
      if (response.status === 200) {
        // Refresh only subscription data, not entire page
        await fetchSubscriptionStatus()
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.post('/api/subscriptions/reactivate', { subscriptionId })
      if (response.status === 200) {
        // Refresh only subscription data, not entire page
        await fetchSubscriptionStatus()
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isScheduledForCancellation) {
    return (
      <>
        {isLoading && <Loader />}
        {isInitialLoading && <Loader />}
        <button
          onClick={handleReactivateSubscription}
          disabled={isLoading}
          className="mt-4 text-sm font-medium text-green-600 hover:text-green-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
          {isLoading ? t('reactivating') : t('reactivate-subscription')}
        </button>
      </>
    )
  }

  return (
    <>
      {isLoading && <Loader />}
      {isInitialLoading && <Loader />}
      <button
        onClick={handleCancelSubscription}
        disabled={isLoading}
        className="mt-4 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? t('canceling') : t('cancel-subscription')}
      </button>
    </>
  )
}
