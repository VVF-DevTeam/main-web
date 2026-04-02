// Libraries
import { getAllPublishedEventsWithRelations } from '@/lib/actions/event/getEvent'

// Components
import EventListHorizontal from './_components/EventListHorizontal'
// import EventAdminButtons from './_components/EventAdminButtons'
// import EventHeroImage from './_components/EventHeroImage'
import EventInstruction from './_components/EventInstruction'
import EventCalendar from './_components/EventCalendar'

// Note: Pages with searchParams are dynamic and cannot be edge-cached by Vercel
export const dynamic = 'force-dynamic'

// Main Component
const EventsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ upcomingPage?: number; finishedPage?: number }>
}) => {
  const { locale } = await params
  const { upcomingPage, finishedPage } = await searchParams

  // Get all published events with relations (cached)
  const allEvents = await getAllPublishedEventsWithRelations()

  // If no events, return component with message
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

  // For pagination
  const upcomingPageNum = Number(upcomingPage || 1)
  const finishedPageNum = Number(finishedPage || 1)
  const eventsPerPage = 3
  const totalPagesUpcoming = Math.ceil(upcomingEvents.length / eventsPerPage)
  const totalPagesFinished = Math.ceil(finishedEvents.length / eventsPerPage)

  // Paginate the filtered arrays
  const paginatedUpcomingEvents = upcomingEvents.slice(
    (upcomingPageNum - 1) * eventsPerPage,
    upcomingPageNum * eventsPerPage
  )
  // console.log(paginatedUpcoming)

  const paginatedFinishedEvents = finishedEvents.slice(
    (finishedPageNum - 1) * eventsPerPage,
    finishedPageNum * eventsPerPage
  )

  return (
    <div className="flex flex-col">
      {/* <EventHeroImage locale={locale} /> */}
      <EventListHorizontal
        events={paginatedUpcomingEvents}
        locale={locale}
        currentPage={upcomingPageNum}
        totalPages={totalPagesUpcoming}
        totalItems={upcomingEvents.length}
      />z
      {/* <EventAdminButtons /> */}
      <EventCalendar events={allEvents} locale={locale} />
      {finishedEvents.length > 0 && (
        <EventListHorizontal
          events={paginatedFinishedEvents}
          locale={locale}
          finished={true}
          currentPage={finishedPageNum}
          totalPages={totalPagesFinished}
          totalItems={finishedEvents.length}
        />
      )}
      <EventInstruction locale={locale} />
    </div>
  )
}

export default EventsPage
