// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllEvents } from '@/lib/actions/event/getEvent'

// Components
import EventManagement from './_components/EventManagement'
import ServerError from '@/components/error/ServerError'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const AllEvents = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' }))
  ) {
    return redirect('/events')
  }

  // Get all published and unpublished events
  const allEvents = await getAllEvents()

  // Check if there was an error (events should not be null)
  if (!allEvents) {
    return <ServerError />
  }

  return (
    <EventManagement
      allEvents={allEvents}
      createEventLink="/events/createEvent"
      editLinkPattern="/events/editEvent/{keyName}"
      showBackButton={true}
    />
  )
}

export default AllEvents
