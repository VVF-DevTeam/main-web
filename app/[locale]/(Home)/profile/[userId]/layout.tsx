'use server'
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import Sidebar from './_components/SideBar'

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; userId: string }>
}) {
  const { locale, userId } = await params
  const user = await getCurrentUserInfo()

  if (!user) {
    return <p className="mt-10 text-center">No user data available.</p>
  }

  return (
    <div>
      <div className="bg-bgColor-white flex min-h-screen flex-col md:flex-row">
        {/* Sidebar (Passes locale & userId for navigation) */}
        <Sidebar locale={locale} userId={userId} user={user} />

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-10">{children}</div>
      </div>
    </div>
  )
}
