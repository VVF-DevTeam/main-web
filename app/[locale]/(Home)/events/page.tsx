// Components
import EventList from './_components/EventList'
import EventAdminButtons from './_components/EventAdminButtons'
import EventHeroImage from './_components/EventHeroImage'
import EventInstruction from './_components/EventInstruction'

// Libraries
import { Suspense } from 'react'
import { prisma } from '@/lib/db'

const EventsPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {

  const { locale } = await params

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
      <Suspense
        fallback={
          <p className="text-center text-xl text-muted-foreground">
            loading...
          </p>
        }
      >
        <EventList events={allEvents} />
      </Suspense>
      <EventAdminButtons />
      <EventInstruction locale={locale} />
    </div>
  )
}

export default EventsPage
