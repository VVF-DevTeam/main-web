// Libraries
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'

// Components
import EventList from './_components/EventList'
import EventAdminButtons from './_components/EventAdminButtons'
import EventHeroImage from './_components/EventHeroImage'
import EventInstruction from './_components/EventInstruction'
import EventCalendar from './_components/EventCalendar'

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

  // TODO: Fix: Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
  // Get all events
  const allEvents = await prisma.event.findMany({
    where: {
      isPublished: true,
    },
    include: {
      categories: true
    }
  })
  if (allEvents.length === 0) {
    return (
      <p className="text-center text-xl text-muted-foreground">
        OOPS..... No events to show!
      </p>
    )
  }

  // Filter upcoming and finished events
  const now = new Date()
  const upcomingEvents = allEvents.filter(
    (event) => new Date(event.endDate) >= now
  )
  const finishedEvents = allEvents.filter(
    (event) => new Date(event.endDate) < now
  )

  return (
    <div className="flex flex-col gap-y-6">
      <EventHeroImage locale={locale} />
      <EventList events={upcomingEvents} locale={locale} />
      {(isAdmin || isHost) && <EventAdminButtons />}
      <EventInstruction locale={locale} />
      <EventCalendar events={allEvents} locale={locale} />
      {finishedEvents.length > 0 && (
        <EventList events={finishedEvents} locale={locale} finished={true} />
      )}
    </div>
  )
}

export default EventsPage
