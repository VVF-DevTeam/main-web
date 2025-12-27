// Libraries
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'

// Components
import BackButton from '@/components/ui/back-button'
import SponsorsManager from '../_components/SponsorsManager'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const ManageSponsorsPage = async () => {
  // Only ADMIN or HOST can access this page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' }))
  ) {
    return redirect('/events')
  }
  let sponsorsWithEvents = []
  let allEvents = []

  try {
    // Get all sponsors with their events
    sponsorsWithEvents = await prisma.eventSponsor.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        events: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            tier: 'asc',
          },
        },
      },
    })

    // Get all events for the dropdown to select which events to associate with the sponsor
    allEvents = await prisma.event.findMany({
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
      },
    })
  } catch (error) {
    console.error('Error fetching sponsors with events:', error)
    return []
  }

  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />
      <SponsorsManager
        sponsors={sponsorsWithEvents ?? []}
        allEvents={allEvents ?? []}
      />
    </div>
  )
}

export default ManageSponsorsPage
