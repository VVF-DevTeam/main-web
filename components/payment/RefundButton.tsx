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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
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
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirmModal(false)
          }}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Confirm Full Refund</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to refund ${amount.toFixed(2)} for this payment?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowConfirmModal(false)
                  await handleRefund()
                }}
                className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={disabled || isLoading}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          method === 'ETF' || method === 'Cash' || method === 'BankTransfer'
            ? ''
            : 'whitespace-nowrap'
        }
          ${
            disabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }
        `}
      >
        {method === 'ETF' || method === 'Cash' || method === 'BankTransfer' ? (
          <span className="flex flex-col items-center leading-tight">
            <span>Payment by {method}</span>
            <span>(Refund not available)</span>
          </span>
        ) : isLoading ? (
          'Processing...'
        ) : (
          'Full Refund'
        )}
      </button>
    </>
  )
} 