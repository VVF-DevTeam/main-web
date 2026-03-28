// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllEventCategories } from '@/lib/actions/event/getEventCategories'
import { getAllEventSeries } from '@/lib/actions/event/getEventSeries'
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import { getEventForEditing } from '@/lib/actions/event/getEventById'

// Components
import EditEvent from '@/app/[locale]/(Home)/events/(Admin)/editEvent/[eventKeyName]/_components/EditEvent'
import NotFound from '@/app/[locale]/(Home)/not-found'

// Main Component
const EditEventPage = async ({
  params,
}: {
  params: Promise<{ eventKeyName: string; locale: string }>
}) => {
  const isSuperAdmin = await roleCheck({ role: 'SUPERADMIN' })

  // check if the current user is an admin or host to allow access to the post control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' })) &&
    !isSuperAdmin
  ) {
    return redirect('/events')
  }

  const { eventKeyName } = await params

  // Get current user info
  const user = await getCurrentUserInfo()
  if (!user) {
    return redirect('/signIn')
  }

  // Fetch event data, categories, and series in parallel
  const [event, categories, allSeries] = await Promise.all([
    getEventForEditing(eventKeyName),
    getAllEventCategories(),
    getAllEventSeries(),
  ])

  if (!event) {
    return <NotFound />
  }

  return (
    <EditEvent
      event={event}
      categories={categories}
      allSeries={allSeries}
      isSuperAdmin={Boolean(isSuperAdmin)}
      showBackButton={true}
      categoriesLink="/events/createEventCategory"
      seriesLink="/events/createEventSeries"
      sponsorsLink="/events/manageSponsors"
    />
  )
}

export default EditEventPage
