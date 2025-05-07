'use server'
// Libraries
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import { prisma } from '@/lib/db'

// Components
import MyProfile from './_components/MyProfile'
import UpdateProfileForm from './_components/UpdateProfileForm'
import PasswordForm from './_components/PasswordForm'
import DeleteForm from './_components/DeleteForm'

// Main Component
export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ section?: string }>
}) {
  const user = await getCurrentUserInfo()
  // Get all events
  const eventList = await prisma.event.findMany({
    where: {
      isPublished: true,
    },
  })

  const { section } = await searchParams
  const { locale } = await params

  // return if user is not logged in
  if (!user) {
    return <p className="mt-10 text-center">No user data available.</p>
  }
  console.log(user.id)
  // get payment history
  const paymentHistory = await prisma.payment.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      pricePaid: true,
      createdAt: true,
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
    default:
      return (
        <MyProfile
          user={user}
          locale={locale}
          events={eventList}
          upcoming_events={eventList}
          paymentHistory={paymentHistory}
        />
      )
  }
}
