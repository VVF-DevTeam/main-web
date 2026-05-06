import { getPaginatedPayments } from '@/lib/actions/payment/getPaginatedPayments'
import AddPaymentButton from './AddEventPaymentButton'
import AddShopPaymentButton from './AddShopPaymentButton'
import PartialRefundButton from './PartialRefundButton'
import PaymentPageSizeSelect from './PaymentPageSizeSelect'
import { UserInfoProps } from '@/lib/types/userInfo'
import PaymentManagementClient from './PaymentManagementClient'
import PaymentTypeTabs, { PaymentTypeTab } from './PaymentTypeTabs'

export default async function PaymentManagement({
  user,
  page = 1,
  pageSize = 5,
  dbSearch = '',
  paymentTypeTab = 'all',
}: {
  user: UserInfoProps
  page?: number
  pageSize?: number
  dbSearch?: string
  paymentTypeTab?: PaymentTypeTab
}) {
  // Check if user has permission
  if (!user.role.includes('ADMIN') && !user.role.includes('HOST') && !user.role.includes('SUPERADMIN')) {
    return <div>You are not allowed to view this page</div>
  }

  // Fetch latest 100 rows and paginate/filter on the client.
  const { payments } = await getPaginatedPayments(user, 1, 100, dbSearch)

  if (!payments) {
    return <div>Error loading payments</div>
  }

  return (
    <div className="min-h-screen md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Headers & Add Record Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Client Payment Management</h1>
          <div className="flex flex-col-center lg:flex-row items-center gap-2">
            <AddPaymentButton user={user} />
            <AddShopPaymentButton user={user} />
            {(user.role.includes('ADMIN') || user.role.includes('SUPERADMIN')) && (
              <PartialRefundButton user={user} />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <PaymentTypeTabs activeTab={paymentTypeTab} />
          <PaymentPageSizeSelect value={pageSize} />
        </div>

        <PaymentManagementClient
          payments={JSON.parse(JSON.stringify(payments))}
          dbSearch={dbSearch}
          pageSize={pageSize}
          currentPage={page}
          paymentTypeTab={paymentTypeTab}
          refundMonitorUserId={user.id}
        />
      </div>
    </div>
  )
}
