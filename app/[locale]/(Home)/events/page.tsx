import EventList from './_components/EventList'
import { prisma } from '@/lib/db'
import EventAdminButtons from './_components/EventAdminButtons'
import EventHeroImage from './_components/EventHeroImage'
import EventInstruction from './_components/EventInstruction'
import { adminCheck } from '@/lib/utilFunctions/adminCheck'

// import { Suspense } from 'react'

const EventsPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  const admin = await adminCheck()

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
      <EventList events={allEvents} />
      {admin && <EventAdminButtons />}
      <EventInstruction locale={locale} />
    </div>
  )
}

export default EventsPage
