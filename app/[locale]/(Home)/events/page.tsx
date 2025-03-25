// Libraries
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'

// Components
import EventList from './_components/EventList'
import EventAdminButtons from './_components/EventAdminButtons'
import EventHeroImage from './_components/EventHeroImage'
import EventInstruction from './_components/EventInstruction'

// import { Suspense } from 'react'

// Main Component
const EventsPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  const isAdmin = await roleCheck({ role: 'ADMIN' })
  const isHost = await roleCheck({ role: 'HOST' })

  // Get all events
  const allEvents = await prisma.event.findMany({
    where: {
      isPublished: true,
    },
  })
  if (allEvents.length === 0) {
    return (
      <p className="text-center text-xl text-muted-foreground">
        OOPS..... No events to show!
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-y-6">
      <EventHeroImage locale={locale} />
      <EventList events={allEvents} locale={locale} />
      {(isAdmin || isHost) && <EventAdminButtons />}
      <EventInstruction locale={locale} />
    </div>
  )
}

export default EventsPage
