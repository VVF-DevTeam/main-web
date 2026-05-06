'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Loader from '@/components/loader/Loader'

export type PaymentTypeTab = 'all' | 'incoming' | 'refund'

const tabs: Array<{ id: PaymentTypeTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'incoming', label: 'Incoming Payments' },
  { id: 'refund', label: 'Outcoming/Refund Payments' },
]

interface PaymentTypeTabsProps {
  activeTab: PaymentTypeTab
}

export default function PaymentTypeTabs({ activeTab }: PaymentTypeTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleTabChange = (tab: PaymentTypeTab) => {
    if (tab === activeTab) return
    const params = new URLSearchParams(searchParams)
    params.set('paymentTypeTab', tab)
    params.set('page', '1')
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      {isPending && <Loader />}
      <nav className="flex space-x-8" aria-label="Payment tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  )
}
