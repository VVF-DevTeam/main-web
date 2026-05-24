'use client'

import { KeyboardEvent, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RefundButton from '@/components/payment/RefundButton'
import PaymentNoteButton from '@/components/payment/PaymentNoteButton'
import { getPaymentStatus, getStatusColor } from '@/lib/actions/payment/paymentStatus'
import { Input } from '@/components/ui/input'
import ExportToExcelButton from '@/components/button/ExportToExcelButton'
import { PaymentMethod, PaymentType } from '@prisma/client'
import { Search } from 'lucide-react'
import PaymentPagination from './PaymentPagination'
import { PaymentTypeTab } from './PaymentTypeTabs'

type ClientPayment = {
  id: string
  pricePaid: number | string
  createdAt: string
  type: PaymentType
  expiresAt: string | null
  quantity: number
  method: PaymentMethod
  refunded: boolean
  stripePaymentId: string | null
  seatNumber: string | null
  guestName: string | null
  guestEmail: string | null
  note: string | null
  user: {
    name: string | null
    email: string
  } | null
  monitorUser: {
    name: string | null
  } | null
  event: {
    title: string
    keyName: string
    startDate: string | null
    endDate: string
    location: string | null
  } | null
  eventTicket: {
    stripeProductId: string
  } | null
}

const paymentTypeMap = {
  Membership: 'Membership',
  Class: 'Class',
  ClassDropIn: 'Class Drop-in',
  ClassFullCourse: 'Class Full Course',
  Concert: 'Concert',
  Camping: 'Camping',
  Event: 'Event',
  Shop: 'Shop',
  Refund: 'Refund',
} as const

interface PaymentManagementClientProps {
  payments: ClientPayment[]
  dbSearch: string
  pageSize: number
  currentPage: number
  paymentTypeTab: PaymentTypeTab
  refundMonitorUserId: string
}

export default function PaymentManagementClient({
  payments,
  dbSearch,
  pageSize,
  currentPage,
  paymentTypeTab,
  refundMonitorUserId,
}: PaymentManagementClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localSearch, setLocalSearch] = useState('')
  const [dbSearchInput, setDbSearchInput] = useState(dbSearch)

  const filteredPayments = useMemo(() => {
    const normalizedSearch = localSearch.trim().toLowerCase()
    const tabFilteredPayments = payments.filter((payment) => {
      const typeForFilter = payment.type
      if (paymentTypeTab === 'refund') return typeForFilter === 'Refund'
      if (paymentTypeTab === 'incoming') return typeForFilter !== 'Refund'
      return true
    })

    if (!normalizedSearch) return tabFilteredPayments

    return tabFilteredPayments.filter((payment) => {
      const email = payment.user?.email || payment.guestEmail || ''
      const customer = payment.user?.name || payment.guestName || ''
      const eventTitle = payment.event?.title || ''
      const location = payment.event?.location || ''
      const type = paymentTypeMap[payment.type] || payment.type

      return [email, customer, eventTitle, location, type]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [localSearch, payments, paymentTypeTab])

  const totalItems = filteredPayments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const clampedCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (clampedCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex)

  const applyDatabaseSearch = () => {
    const params = new URLSearchParams(searchParams)
    const trimmed = dbSearchInput.trim()

    if (trimmed) {
      params.set('paymentSearch', trimmed)
    } else {
      params.delete('paymentSearch')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const onDatabaseSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      applyDatabaseSearch()
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-sm text-muted-foreground">Showing 100 latest payments, if you cannot find the payment, please use the database search.</span>
        <ExportToExcelButton
          data={filteredPayments.map((payment) => {
            const startDate = new Date(
              payment.type === 'Membership'
                ? payment.createdAt
                : payment.event?.startDate || payment.createdAt
            )
            const endDate = new Date(
              payment.type === 'Membership'
                ? payment.expiresAt || payment.createdAt
                : payment.event?.endDate || payment.createdAt
            )
            const isGuestCheckout = !payment.user && (payment.guestEmail || payment.guestName)
            return {
              Event: payment.event?.title || '-',
              Email: payment.user?.email || payment.guestEmail || '-',
              Customer: payment.user?.name || payment.guestName || '-',
              'Start Date': startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              'End Date': endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
              Location: payment.type === 'Membership' ? '-' : (payment.event?.location || '-'),
              Amount: Number(payment.pricePaid).toFixed(2),
              'Quantity/Seat': `${payment.quantity}/${payment.seatNumber || '-'}`,
              Type: isGuestCheckout
                ? `${paymentTypeMap[payment.type]} (Guest Checkout)`
                : paymentTypeMap[payment.type],
              Status: getPaymentStatus({
                ...payment,
                createdAt: new Date(payment.createdAt),
                expiresAt: payment.expiresAt ? new Date(payment.expiresAt) : null,
                event: payment.event
                  ? {
                      ...payment.event,
                      startDate: payment.event.startDate ? new Date(payment.event.startDate) : null,
                      endDate: new Date(payment.event.endDate),
                    }
                  : null,
              }),
            }
          })}
          filename={
            !localSearch.trim() && !dbSearchInput.trim()
              ? 'VVF-client-payments-last-100-payments'
              : `VVF-client-payments-filtered-by-${localSearch}-${dbSearchInput}`
          }
          sheetName="All Client Payments"
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder="Local search (instant): event, email, customer..."
            className="pl-9"
          />
        </div>
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            value={dbSearchInput}
            onChange={(event) => setDbSearchInput(event.target.value)}
            onKeyDown={onDatabaseSearchKeyDown}
            placeholder="Database search (Prisma): press Enter to search"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-scroll">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left">Event</th>
              <th className="max-w-[150px] break-words px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Created At</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Quantity/Seat</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              {paymentTypeTab === 'refund' && (
                <th className="px-4 py-3 text-left">Monitor Name</th>
              )}
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPayments.length > 0 ? (
              paginatedPayments.map((payment) => {
                const createdAt = new Date(payment.createdAt)
                const status = getPaymentStatus({
                  ...payment,
                  createdAt: new Date(payment.createdAt),
                  expiresAt: payment.expiresAt ? new Date(payment.expiresAt) : null,
                  event: payment.event
                    ? {
                        ...payment.event,
                        startDate: payment.event.startDate ? new Date(payment.event.startDate) : null,
                        endDate: new Date(payment.event.endDate),
                      }
                    : null,
                })
                const statusColor = getStatusColor(status)
                const isGuestCheckout = !payment.user && (payment.guestEmail || payment.guestName)
                const displayEmail = payment.user?.email || payment.guestEmail || '-'
                const displayName = payment.user?.name || payment.guestName || '-'
                const paymentTypeDisplay = isGuestCheckout
                  ? `${paymentTypeMap[payment.type]} (Guest Checkout)`
                  : paymentTypeMap[payment.type]

                return (
                  <tr key={payment.id} className="bg-white">
                    <td className="px-4 py-3">{payment.event?.title || '-'}</td>
                    <td className="max-w-[150px] break-words whitespace-normal px-4 py-3">
                      {displayEmail}
                    </td>
                    <td className="px-4 py-3">{displayName}</td>
                    <td className="px-4 py-3">
                      {createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">${Number(payment.pricePaid).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {payment.quantity}/{payment.seatNumber || '-'}
                    </td>
                    <td className="px-4 py-3">{paymentTypeDisplay}</td>
                    <td className={`px-4 py-3 font-medium ${statusColor}`}>{status}</td>
                    {paymentTypeTab === 'refund' && (
                      <td className="px-4 py-3">{payment.monitorUser?.name || '-'}</td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-2">
                        <PaymentNoteButton note={payment.note} />
                        {paymentTypeTab !== 'refund' && (
                          <RefundButton
                            paymentId={payment.id}
                            stripeProductId={payment.eventTicket?.stripeProductId || payment.stripePaymentId}
                            method={payment.method}
                            amount={Number(payment.pricePaid)}
                            monitorUserId={refundMonitorUserId}
                            disabled={
                              status === 'Expired' ||
                              status === 'Past' ||
                              status === 'Refunded' ||
                              payment.method === 'ETF' ||
                              payment.method === 'Cash' ||
                              payment.method === 'BankTransfer'
                            }
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={paymentTypeTab === 'refund' ? 10 : 9} className="px-4 py-3 text-center">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <PaymentPagination
          currentPage={clampedCurrentPage}
          totalPages={totalPages}
          showPageInfo
          totalItems={totalItems}
        />
      </div>
    </>
  )
}
