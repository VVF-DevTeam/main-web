// Libraries
import { getAllEventSponsors } from '@/lib/actions/event/getEventSponsors'
import { getAllEvents } from '@/lib/actions/event/getEvent'

// Components
import SponsorsManager from '@/app/[locale]/(Home)/events/(Admin)/_components/SponsorsManager'

interface SponsorsManagementProps {
  user: {
    role: string[]
  }
}

export default async function SponsorsManagement({
  user,
}: SponsorsManagementProps) {
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
    return (
      <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
        <p className="text-center text-red-500">
          Error loading sponsors. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      <SponsorsManager
        sponsors={sponsorsWithEvents ?? []}
        allEvents={allEvents ?? []}
      />
    </div>
  )
}

