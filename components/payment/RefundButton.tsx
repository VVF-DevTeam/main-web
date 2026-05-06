'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { axiosInstance } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { PaymentMethod } from '@prisma/client'
import Loader from '@/components/loader/Loader'

interface RefundButtonProps {
  paymentId: string
  amount: number
  disabled?: boolean
  stripeProductId: string | null
  method: PaymentMethod
  /** Logged-in admin/superadmin who performs the refund (stored as Payment.monitorUserId). */
  monitorUserId: string
}

export default function RefundButton({
  paymentId,
  amount,
  disabled = false,
  stripeProductId,
  method,
  monitorUserId,
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
        monitorUserId,
      })
      toast.success('Refund processed successfully', {
        description: `$${amount.toFixed(2)} will be refunded to user account in 5-7 business days`,
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      
      // Refresh the page data - the refund API already revalidates the cache
      router.refresh()
    } catch (error) {
      toast.error('Failed to process refund', {
        description: `Please contact team dev for assistance`,
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
    <>
      {isLoading && <Loader />}
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
        {method === 'ETF' || method === 'Cash' || method === 'BankTransfer' ? `Payment by ${method} (Refund not available here)` : isLoading ? 'Processing...' : 'Full Refund'}
      </button>
    </>
  )
} 