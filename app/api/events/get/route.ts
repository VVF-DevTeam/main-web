import { NextRequest, NextResponse } from 'next/server'
import { getEventById } from '@/lib/actions/event/getEventById'
import { getEventPagiation } from '@/lib/actions/event/getEventPagination'

export const GET = async (request: NextRequest) => {
  const eventId = request?.nextUrl?.searchParams.get('eventId')
  const searchTitle = request?.nextUrl?.searchParams.get('title') || undefined
  const pageNum = Number(request?.nextUrl?.searchParams.get('pageNum')) || 0
  const pageSize = Number(request?.nextUrl?.searchParams.get('pageSize')) || 4
  const isPublishedParam = request?.nextUrl.searchParams.get('isPublished')
  const isPublished =
    isPublishedParam === 'true'
      ? true
      : isPublishedParam === 'false'
        ? false
        : undefined

  let event = null
  let totalEvent = 0

  const requestTime = new Date()

  try {
    if (!eventId) {
      const [events, total] = await getEventPagiation({
        searchTitle,
        isPublished,
        requestTime,
        pageNum,
        pageSize,
      })
      event = events.map((item) => ({
        ...item,
        remainingTicket: (item.capacity || 0) - (item.ticketsSold || 0),
      }))
      totalEvent = total
    } else {
      event = await getEventById({ eventId, requestTime })
      if (!event)
        return NextResponse.json(
          { message: 'Event not found' },
          { status: 404 }
        )
    }
    return NextResponse.json(
      { data: event, total: totalEvent, pageSize, pageNum },
      { status: 200 }
    )
  } catch (error) {
    console.log('[Update EVENT ERROR]', error)
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}
