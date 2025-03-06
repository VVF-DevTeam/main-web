// Libraries
import React from 'react'

// Components
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Interfaces
const EventAdminButtons = () => {
  return (
    <div className="my-6 flex-end gap-x-4 px-6">
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
      {/* Create New Tag */}
      <Link href={'/events/createEventCategory'}>
        <Button variant={'gray'} size={'lg'}>
          Create New Tag
        </Button>
      </Link>
    </div>
  )
}

export default EventAdminButtons
