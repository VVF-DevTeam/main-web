import RefundButton from '@/components/payment/RefundButton'
import {
  getPaymentStatus,
  getStatusColor,
} from '@/lib/actions/payment/paymentStatus'
import { getPaginatedPayments } from '@/lib/actions/payment/getPaginatedPayments'
import AddPaymentButton from './AddPaymentButton'
import PaymentPagination from './PaymentPagination'
import PaymentPageSizeSelect from './PaymentPageSizeSelect'
import { UserInfoProps } from '@/lib/types/userInfo'

const paymentTypeMap = {
  Membership: 'Membership',
  Class: 'Class',
  ClassDropIn: 'Class Drop-in',
  ClassFullCourse: 'Class Full Course',
  Concert: 'Concert',
  Camping: 'Camping',
  Event: 'Event',
}

export default async function PaymentManagement({
  user,
  page = 1,
  pageSize = 20,
}: {
  user: UserInfoProps
  page?: number
  pageSize?: number
}) {
  // Check if user has permission
  if (!user.role.includes('ADMIN') && !user.role.includes('HOST')) {
    return <div>You are not allowed to view this page</div>
  }

  // Get paginated payments with caching
  const { payments, totalCount, totalPages } = await getPaginatedPayments(
    user,
    page,
    pageSize
  )

  if (!payments) {
    return <div>Error loading payments</div>
  }

  return (
    <div className="min-h-screen md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Headers & Add Record Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Payments Management</h1>
          <AddPaymentButton user={user} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <PaymentPageSizeSelect value={pageSize} />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {totalCount}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-scroll">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">Event</th>
                <th className="px-4 py-3 text-left max-w-[150px] break-words">
                  Email
                </th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Quantity/Seat</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments && payments.length > 0 ? (
                payments.map((payment, index) => {
                  const startDate = new Date(
                    payment.type === 'Membership'
                      ? payment.createdAt
                      : payment.event?.startDate || payment.createdAt
                  )
                  const endDate = new Date(
                    payment.type === 'Membership'
                      ? payment.expiresAt!
                      : payment.event?.endDate || payment.createdAt
                  )

                  const status = getPaymentStatus(payment)
                  const statusColor = getStatusColor(status)

                  // Check if this is a guest checkout payment
                  const isGuestCheckout = !payment.user && (payment.guestEmail || payment.guestName)
                  const displayEmail = payment.user?.email || payment.guestEmail || '-'
                  const displayName = payment.user?.name || payment.guestName || '-'
                  const paymentTypeDisplay = isGuestCheckout
                    ? `${paymentTypeMap[payment.type]} (Guest Checkout)`
                    : paymentTypeMap[payment.type]

                  return (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3">
                        {payment.event?.title || '-'}
                      </td>
                      <td className="px-4 py-3 max-w-[150px] break-words whitespace-normal">
                        {displayEmail}
                      </td>
                      <td className="px-4 py-3">
                        {displayName}
                      </td>
                      <td className="px-4 py-3">
                        {startDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {endDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {payment.type === 'Membership'
                          ? '-'
                          : payment.event?.location || '-'}
                      </td>
                      <td className="px-4 py-3">
                        ${Number(payment.pricePaid).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {payment.quantity}/{payment.seatNumber || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {paymentTypeDisplay}
                      </td>
                      <td className={`px-4 py-3 font-medium ${statusColor}`}>
                        {status}
                      </td>
                      <td className="px-4 py-3">
                        <RefundButton
                          paymentId={payment.id}
                          stripeProductId={
                            payment.eventTicket?.stripeProductId ||
                            payment.stripePaymentId
                          }
                          method={payment.method}
                          amount={Number(payment.pricePaid)}
                          disabled={
                            status === 'Expired' ||
                            status === 'Past' ||
                            status === 'Refunded' ||
                            payment.method === 'ETF' ||
                            payment.method === 'Cash' ||
                            payment.method === 'BankTransfer'
                          }
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-3 text-center">
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaymentPagination
          currentPage={page}
          totalPages={totalPages}
          showPageInfo
          totalItems={totalCount}
        />
      </div>
    </div>
  )
}
