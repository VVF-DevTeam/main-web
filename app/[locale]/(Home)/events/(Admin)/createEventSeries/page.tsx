// Libraries
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'

// Components
import SeriesManager from '../_components/SeriesManager'
import BackButton from '@/components/ui/back-button'

// Main Component
const createEventSeriesPage = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (!(await roleCheck({ role: 'ADMIN' })) && !(await roleCheck({ role: 'HOST' }))) {
    return redirect('/events')
  }

  // Get all event series
  const eventSeries = await prisma.eventSeries.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />

      <SeriesManager eventSeries={eventSeries} />
    </div>
  )
}

export default createEventSeriesPage

