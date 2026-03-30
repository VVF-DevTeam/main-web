// Libraries
import { redirect } from 'next/navigation'
import { getAllEvents, getEventsOfHost, type EventWithHostsForAdmin } from '@/lib/actions/event/getEvent'
import { getCurrentUserRoleAndId } from '@/lib/actions/user/getCurrentUserRoleAndId'

// Components
import EventManagement from './_components/EventManagement'
import ServerError from '@/components/error/ServerError'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const AllEvents = async () => {
  const { role, id } = await getCurrentUserRoleAndId()
  // check if the current user is an admin to allow access to the post control page
  if (
    !role.includes('ADMIN') &&
    !role.includes('HOST') &&
    !role.includes('SUPERADMIN')
  ) {
    return redirect('/events')
  }

  // Get all published and unpublished events
  let allEvents: EventWithHostsForAdmin[] = []
  if (role.includes('HOST')) {
    allEvents = await getEventsOfHost(id)
  } else {
    allEvents = await getAllEvents()
  }

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
      userRole={role}
      userId={id}
    />
  )
}

export default AllEvents
