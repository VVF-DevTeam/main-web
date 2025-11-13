'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { invalidatePaymentCache } from '@/lib/actions/payment/paymentCache'

interface RefundButtonProps {
  paymentId: string
  amount: number
  disabled?: boolean
  stripeProductId: string
}

export default function RefundButton({
  paymentId,
  amount,
  disabled = false,
  stripeProductId,
}: RefundButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const handleRefund = async () => {
    try {
      setIsLoading(true)
      await axiosInstance.post('/api/payment/refund', {
        paymentId,
        amount,
        stripeProductId,
      })
      toast.success('Refund processed successfully', {
        description: `Payment by ${stripeProductId}`,
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      
      // Invalidate payment cache and refresh the page data
      invalidatePaymentCache()
      router.refresh()
    } catch (error) {
      toast.error('Failed to process refund', {
        description: `Payment by ${stripeProductId}`,
        style: {
          color: '#ef4444', // red-500 color
        },
      })
      console.error('Refund error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefund}
      disabled={disabled || isLoading}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors
        ${
          disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'bg-red-100 text-red-600 hover:bg-red-200'
        }
      `}
    >
      {['etf', 'cash', 'bank-transfer'].includes(stripeProductId) ? `Payment by ${stripeProductId} (Refund not available here)` : isLoading ? 'Processing...' : 'Refund'}
    </button>
  )
} 