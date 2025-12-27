// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllEvents } from '@/lib/actions/event/getEvent'

// Components
import BackButton from '@/components/ui/back-button'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'

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

  return (
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />

      {/* Events Table */}
      <h1 className="header-sub">All Events</h1>
      <p className="mb-12 text-sm text-muted-foreground">
        All published and unpublished events appear here. Click on the
        <span className="hover:text-textColor-brand/70 font-semibold text-textColor-brand900 transition-all">
          {' '}
          &quot;Edit&quot;
        </span>{' '}
        button to edit a event.
      </p>
      <DataTable columns={columns} data={allEvents} />
    </div>
  )
}

export default AllEvents
