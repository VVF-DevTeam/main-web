// Libraries
import { auth } from '@/auth'

// Components
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const EventAdminButtons = async () => {
  const session = await auth()

  const userRole = session?.user?.role
  const isAdmin = userRole?.includes('ADMIN')
  const isHost = userRole?.includes('HOST')

  // Only show buttons for admin or host users
  if (!isAdmin && !isHost) return null

  return (
    <div className="flex-col-end flex-end-md my-6 gap-x-4 gap-y-3 px-6 md:flex-row">
      {/* Create Event */}
      <Link href={'/events/createEvent'}>
        <Button variant={'default'} size={'lg'}>
          Create Event
        </Button>
      </Link>
      {/* View All Events */}
      <Link href={'/events/allEvents'}>
        <Button variant={'outline'} size={'lg'}>
          View All Events
        </Button>
      </Link>
      {/* Create & Edit Tags */}
      {isAdmin && (
        <Link href={'/events/createEventCategory'}>
          <Button variant={'gray'} size={'lg'}>
            Create & Edit Tags
          </Button>
        </Link>
      )}
      {/* Create & Edit Series */}
      {isAdmin && (
        <Link href={'/events/createEventSeries'}>
          <Button size={'lg'} className="bg-bgColor-blue hover:bg-bgColor-blue/80">
            Create & Edit Series
          </Button>
        </Link>
      )}
      {/* Manage Sponsors */}
      {isAdmin && (
        <Link href={'/events/manageSponsors'}>
          <Button size={'lg'} className="bg-bgColor-secondary900 hover:bg-bgColor-secondary400">
            Manage Sponsors
          </Button>
        </Link>
      )}
    </div>
  )
}

export default EventAdminButtons
