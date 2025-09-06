'use server'
// Libraries
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import { prisma } from '@/lib/db'

// Components
import MyProfile from './_components/MyProfile'
import UpdateProfileForm from './_components/UpdateProfileForm'
import PasswordForm from './_components/PasswordForm'
import DeleteForm from './_components/DeleteForm'
import SubscriptionInfo from './_components/SubscriptionInfo'
import PaymentManagement from './_components/PaymentManagement'
import PrivacyPolicy from '../../_components/_policy/PrivacyPolicy'
import EmailComposition from './_components/EmailComposition'

// Main Component
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ section?: string; page?: string; pageSize?: string }>
}) {
  const user = await getCurrentUserInfo()
  // Get all events
  const eventList = await prisma.event.findMany({
    where: {
      isPublished: true,
    },
  })

  const { section, page: pageStr, pageSize: pageSizeStr } = await searchParams
  const { locale } = await params

  // return if user is not logged in
  if (!user) {
    return <p className="mt-10 text-center">No user data available.</p>
  }

  // get payment history (put here since default page is MyProfile)
  const paymentHistory = await prisma.payment.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      pricePaid: true,
      createdAt: true,
      expiresAt: true,
      type: true,
      quantity: true,
      refunded: true,
      event: {
        select: {
          id: true,
          title: true,
          keyName: true,
          imgUrl: true,
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

  // ✅ Switch component based on searchParams
  switch (section) {
    case 'update-profile':
      return <UpdateProfileForm user={user} />
    case 'change-password':
      return <PasswordForm user={user} />
    case 'delete-account':
      return <DeleteForm user={user} />
    case 'subscription':
      return <SubscriptionInfo paymentHistory={paymentHistory} user={user} />
    case 'admin-payment-management':
      // Only show payment management for hosts
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {
        const page = Math.max(1, Number.parseInt(pageStr || '1', 10) || 1)
        const pageSize = [10, 20, 50].includes(Number(pageSizeStr))
          ? Number(pageSizeStr)
          : 20
        return <PaymentManagement user={user} page={page} pageSize={pageSize} />
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )
    case 'admin-email-composition':
      // Only show email composition for hosts and admins
      if (
        user.role &&
        (user.role.includes('HOST') || user.role.includes('ADMIN'))
      ) {

        return (
          <EmailComposition user={user}/>
        )
      }
      return (
        <p className="mt-10 text-center">
          You do not have permission to view this page.
        </p>
      )
    case 'privacy-policy':
      return <PrivacyPolicy locale={locale} />
    default:
      return (
        <MyProfile
          user={user}
          locale={locale}
          // events={eventList}
          upcoming_events={eventList}
          paymentHistory={paymentHistory}
        />
      )
  }
}
