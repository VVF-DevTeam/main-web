// Libraries
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'

// Components
import EventListHorizontal from './_components/EventListHorizontal'
import EventAdminButtons from './_components/EventAdminButtons'
import EventHeroImage from './_components/EventHeroImage'
import EventInstruction from './_components/EventInstruction'
import EventCalendar from './_components/EventCalendar'

// Interfaces & Types
import { Event, EventCategory } from '@prisma/client'

// Actions
// import { getPublishedEventsWithFilters } from '@/lib/actions/event/getEvent'

// import { Suspense } from 'react'
// Simple in-memory cache to reduce API calls
let eventsCache: {
  data: (Event & {
    categories: EventCategory[]
  })[]
  timestamp: number
  locale: string
  fetchLimit?: number // Track how many posts we attempted to fetch
} | null = null

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

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
  // Check if user is admin or host
  const isAdmin = await roleCheck({ role: 'ADMIN' })
  const isHost = await roleCheck({ role: 'HOST' })

  // Get all events with caching
  const nowTimestamp = Date.now()
  const isCacheValid = eventsCache && eventsCache.locale === locale && nowTimestamp - eventsCache.timestamp < CACHE_DURATION
  
  let allEvents
  if (isCacheValid) {
    allEvents = eventsCache!.data
  } else {
    allEvents = await prisma.event.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        categories: true,
      },
    })
    
    // Update cache
    eventsCache = {
      data: allEvents,
      timestamp: nowTimestamp,
      locale,
    }
  }

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
    <div className="flex flex-col gap-y-6">
      <EventHeroImage locale={locale} />
      <EventListHorizontal
        events={paginatedUpcomingEvents}
        locale={locale}
        currentPage={upcomingPageNum}
        totalPages={totalPagesUpcoming}
        totalItems={upcomingEvents.length}
      />
      {(isAdmin || isHost) && <EventAdminButtons />}
      <EventInstruction locale={locale} />
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
    </div>
  )
}

export default EventsPage
