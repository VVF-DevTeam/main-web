import { getUserEvents } from '@/lib/actions/event/getUserEvent'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  const userId = request.headers.get('userId') as string
  if (!userId)
    return NextResponse.json({ message: 'Bad Request' }, { status: 400 })
  const pageSize = Number(request.nextUrl.searchParams.get('pageSize')) || 5
  const pageNum = Number(request.nextUrl.searchParams.get('pageNum')) || 0
  const isOldEvent = request.nextUrl.searchParams.get('isOldEvent') === 'true'
  const isPublishedParam = request?.nextUrl.searchParams.get('isPublished')
  const isPublished =
    isPublishedParam === 'true'
      ? true
      : isPublishedParam === 'false'
        ? false
        : undefined
  const requestTime = new Date()
  const [inComingEvent, total] = await getUserEvents({
    userId,
    isOldEvent,
    isPublished,
    pageNum,
    pageSize,
    requestTime,
  })
  return NextResponse.json(
    {
      data: inComingEvent.map((item) => item.event),
      total,
      pageNum: 0,
      pageSize,
    },
    { status: 200 }
  )
}
