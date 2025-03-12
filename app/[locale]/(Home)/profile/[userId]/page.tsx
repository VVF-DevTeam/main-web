'use server'

import { getUserInfo } from '@/lib/utilFunctions/getUserInfo'
import MyProfile from './_components/MyProfile'
import UpdateProfileForm from './_components/UpdateProfileForm'
import PasswordForm from './_components/PasswordForm'
import DeleteForm from './_components/DeleteForm'
import { prisma } from '@/lib/db'

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ section?: string }>
}) {
  const user = await getUserInfo()
  // Get all events
  const eventList = await prisma.event.findMany({
    where: {
      isPublished: true,
    },
  })
  const { section } = await searchParams
  const { locale } = await params
  if (!user) {
    return <p className="mt-10 text-center">No user data available.</p>
  }

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
        />
      )
  }
}
