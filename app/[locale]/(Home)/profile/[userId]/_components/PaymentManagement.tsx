import { prisma } from '@/lib/db'

interface PaymentManagementProps {
  user: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    age: string
    image: string | undefined
    password: string
    subscribedAt: Date | null
    subscribeExpires: Date | null
    stripeSubscriptionId: string | null
    role: string[]
  }
}

const paymentTypeMap = {
  Membership: 'Membership',
  ClassDropIn: 'Class Drop-in',
  ClassFullCourse: 'Class Full Course',
  Concert: 'Concert',
}

export default async function PaymentManagement({ user }: PaymentManagementProps) {
  // Get all events where user is a host
  const hostedEvents = await prisma.event.findMany({
    where: {
      hosts: {
        some: {
          id: user.id
        }
      }
    },
    select: {
      id: true
    }
  })

  const hostedEventIds = hostedEvents.map(event => event.id)

  // Get all payments for hosted events
  const payments = await prisma.payment.findMany({
    where: {
      eventId: {
        in: hostedEventIds
      }
    },
    select: {
      pricePaid: true,
      createdAt: true,
      type: true,
      expiresAt: true,
      quantity: true,
      user: {
        select: {
          name: true,
          email: true
        }
      },
      event: {
        select: {
          title: true,
          keyName: true,
          startDate: true,
          endDate: true,
          location: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Management</h1>
        </div>

        <div className="overflow-x-auto">
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
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.length > 0 ? (
                payments.map((payment, index) => {
                  if (!payment.event) return null;
                  
                  const startDate = new Date(
                    payment.type === 'Membership'
                      ? payment.createdAt
                      : payment.event.startDate!
                  )
                  const endDate = new Date(
                    payment.type === 'Membership'
                      ? payment.expiresAt!
                      : payment.event.endDate
                  )
                  const status = payment.type === 'Membership' 
                    ? (new Date() < endDate ? 'Active' : 'Expired')
                    : (new Date() < endDate ? 'Upcoming' : 'Past')

                  return (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3">{payment.event.title}</td>
                      <td className="px-4 py-3">
                        {payment.user.name || payment.user.email}
                      </td>
                      <td className="px-4 py-3">
                        {startDate.toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        {endDate.toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        {payment.type === 'Membership' ? '-' : payment.event.location}
                      </td>
                      <td className="px-4 py-3">
                        ${Number(payment.pricePaid).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{payment.quantity}</td>
                      <td className="px-4 py-3">
                        {paymentTypeMap[payment.type]}
                      </td>
                      <td className="px-4 py-3">{status}</td>
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