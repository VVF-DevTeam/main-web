// Libraries
import { getAllEvents } from '@/lib/actions/event/getEvent'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

// Components
import EventDataTable from './EventDataTable'

interface EventManagementProps {
  user: {
    id: string
    role: string[]
  }
  locale: string
}

export default async function EventManagement({
  user,
  locale,
}: EventManagementProps) {
  // Get all published and unpublished events
  const allEvents = await getAllEvents()

  return (
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      {/* Events Table */}
      <div className="flex items-center justify-between">
        <h1 className="header-sub">All Events</h1>
        {/* Create Event */}
        <Link href={`/${locale}/profile/${user.id}?section=admin-create-event`}>
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
      <EventDataTable data={allEvents} locale={locale} userId={user.id} />
    </div>
  )
}

