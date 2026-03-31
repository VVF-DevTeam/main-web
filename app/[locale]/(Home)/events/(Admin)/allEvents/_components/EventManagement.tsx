// Libraries
import { Button } from '@/components/ui/button'
import type { EventWithHostsForAdmin } from '@/lib/actions/event/getEvent'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

// Components
import BackButton from '@/components/ui/back-button'
import AllEventsTable from './AllEventsTable'

interface EventManagementProps {
  allEvents: EventWithHostsForAdmin[]
  createEventLink: string
  editLinkPattern: string
  showBackButton?: boolean
  userRole: string[]
  userId: string
}

export default function EventManagement({
  allEvents,
  createEventLink,
  editLinkPattern,
  showBackButton = false,
}: EventManagementProps) {
  return (
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      {/* Back Button To Parent Page */}
      {showBackButton && <BackButton />}

      {/* Events Table */}
      <div className="flex items-center justify-between">
        <h1 className="header-sub">All Events</h1>
        {/* Create Event */}
        <Link href={createEventLink}>
          <Button variant={'default'} className="flex-center gap-x-2">
            <PlusCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Create Event</span>
          </Button>
        </Link>
      </div>

      <p className="mb-12 text-sm text-muted-foreground">
        All published and unpublished events appear here. Click on the
        <span className="hover:text-textColor-brand/70 font-semibold text-textColor-brand900 transition-all">
          {' '}
          &quot;Edit&quot;
        </span>{' '}
        button to edit a event.
      </p>
      <AllEventsTable data={allEvents} editLinkPattern={editLinkPattern} />
    </div>
  )
}

