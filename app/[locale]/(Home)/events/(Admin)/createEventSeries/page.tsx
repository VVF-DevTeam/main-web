// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'
import { getAllEventSeries } from '@/lib/actions/event/getEventSeries'

// Components
import SeriesManager from '../_components/SeriesManager'
import BackButton from '@/components/ui/back-button'
import { EventSeries } from '@prisma/client'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const createEventSeriesPage = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' })) &&
    !(await roleCheck({ role: 'SUPERADMIN' }))
  ) {
    return redirect('/events')
  }

  // Get all event series using cached function
  let eventSeries: EventSeries[] = []
  try {
    eventSeries = await getAllEventSeries()
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />

      <SeriesManager eventSeries={eventSeries} />
    </div>
  )
}

export default createEventSeriesPage
