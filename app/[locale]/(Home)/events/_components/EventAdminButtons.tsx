// Libraries
import React from 'react'
import { roleCheck } from '@/lib/actions/user/roleCheck'

// Components
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Interfaces
const EventAdminButtons = async () => {
  const isAdmin = await roleCheck({ role: 'ADMIN' })
  
  return (
    <div className="flex-col-end my-6 gap-x-4 gap-y-3 px-6 md:flex-row flex-end-md">
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
      {isAdmin && (
        <Link href={'/events/createEventCategory'}>
          <Button variant={'gray'} size={'lg'}>
            Create New Tag
          </Button>
        </Link>
      )}
    </div>
  )
}

export default EventAdminButtons
