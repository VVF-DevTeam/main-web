import { getInfo } from '@/lib/utilFunctions/getInfo'

import ProfileClient from './_components/ProfileClient'

export default async function Profile({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const user = await getInfo()
  if (!user) return <p className="mt-10 text-center">No user data available.</p>

  return (
    <div className="overflow-hidden">
      <ProfileClient user={user} locale={locale} />
    </div>
  )
}
