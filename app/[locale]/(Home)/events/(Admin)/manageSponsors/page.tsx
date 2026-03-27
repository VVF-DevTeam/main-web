// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'
import { getAllEventSponsors } from '@/lib/actions/event/getEventSponsors'
import { getAllEvents } from '@/lib/actions/event/getEvent'

// Components
import BackButton from '@/components/ui/back-button'
import SponsorsManager from '../_components/SponsorsManager'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const ManageSponsorsPage = async () => {
  // Only ADMIN or HOST can access this page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' })) &&
    !(await roleCheck({ role: 'SUPERADMIN' }))
  ) {
    return redirect('/events')
  }
  let sponsorsWithEvents = []
  let allEvents = []

  try {
    // Get all sponsors with their events using cached function
    sponsorsWithEvents = await getAllEventSponsors()

    // Get all events for the dropdown using cached function
    const allEventsData = await getAllEvents()
    allEvents = allEventsData.map((event) => ({
      id: event.id,
      title: event.title,
    })).sort((a, b) => a.title.localeCompare(b.title))
  } catch (error) {
    console.error('Error fetching sponsors with events:', error)
    return []
  }

  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />
      <SponsorsManager
        sponsors={sponsorsWithEvents ?? []}
        allEvents={allEvents ?? []}
      />
    </div>
  )
}

export default ManageSponsorsPage
