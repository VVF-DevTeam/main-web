import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const EventAdminButtons = () => {
  return (
    <div className="my-6 flex items-center justify-end gap-x-4 px-6">
    <Link href={'/events/createEvent'}>
      <Button variant={'default'} size={'lg'}>
        Create Event
      </Button>
    </Link>
    <Link href={'/events/allEvents'}>
      <Button variant={'outline'} size={'lg'}>
        View All Events
      </Button>
    </Link>

    <Link href={'/events/createEventCategory'}>
      <Button
        variant={'link'}
        size={'lg'}
        className="bg-gray-500 text-white"
      >
        Create New Tag
      </Button>
    </Link>
  </div>
  )
}

export default EventAdminButtons