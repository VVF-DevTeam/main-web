import { prisma } from '@/lib/db'
import RefundButton from '@/components/payment/RefundButton'
import {
  getPaymentStatus,
  getStatusColor,
} from '@/lib/actions/payment/paymentStatus'
import AddPaymentButton from './AddPaymentButton'
import { UserInfoProps } from '@/lib/types/userInfo'
import { PaymentWithRelations } from '@/lib/types/payment'

const paymentTypeMap = {
  Membership: 'Membership',
  ClassDropIn: 'Class Drop-in',
  ClassFullCourse: 'Class Full Course',
  Concert: 'Concert',
  Camping: 'Camping',
  Event: 'Event',
}

export default async function PaymentManagement({
  user,
}: {
  user: UserInfoProps
}) {
  let payments: PaymentWithRelations[] | null = null

  // If Admin, get all payments
  if (user.role.includes('ADMIN')) {
    payments = await prisma.payment.findMany({
      select: {
        id: true,
        pricePaid: true,
        createdAt: true,
        type: true,
        expiresAt: true,
        quantity: true,
        stripeProductId: true,
        refunded: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            keyName: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } else if (user.role.includes('HOST')) {
    // If Host, get all payments for hosted events
    const hostedEvents = await prisma.event.findMany({
      where: {
        hosts: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
      },
    })

    const hostedEventIds = hostedEvents!.map((event) => event.id)

    // Get all payments for hosted events
    payments = await prisma.payment.findMany({
      where: {
        eventId: {
          in: hostedEventIds,
        },
      },
      select: {
        id: true,
        pricePaid: true,
        createdAt: true,
        type: true,
        expiresAt: true,
        quantity: true,
        stripeProductId: true,
        refunded: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            keyName: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } else {
    return <div>You are not allowed to view this page</div>
  }

  return (
    <div className="min-h-screen md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Headers & Add Record Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <AddPaymentButton user={user} />
        </div>

        {/* Table */}
        <div className="overflow-x-scroll">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">Event</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Quantity</th>
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

                  return (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3">
                        {payment.event?.title || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {payment.user?.name || payment.user?.email || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {startDate.toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        {endDate.toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        {payment.type === 'Membership'
                          ? '-'
                          : payment.event?.location || '-'}
                      </td>
                      <td className="px-4 py-3">
                        ${Number(payment.pricePaid).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{payment.quantity}</td>
                      <td className="px-4 py-3">
                        {paymentTypeMap[payment.type]}
                      </td>
                      <td className={`px-4 py-3 font-medium ${statusColor}`}>
                        {status}
                      </td>
                      <td className="px-4 py-3">
                        <RefundButton
                          paymentId={payment.id}
                          stripeProductId={payment.stripeProductId}
                          amount={Number(payment.pricePaid)}
                          disabled={
                            status === 'Expired' ||
                            status === 'Past' ||
                            status === 'Refunded' ||
                            payment.stripeProductId === 'etf' ||
                            payment.stripeProductId === 'cash' ||
                            payment.stripeProductId === 'bank-transfer'
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
      </div>
    </div>
  )
}
