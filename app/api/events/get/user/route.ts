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
  const [event, count] = await getUserEvents({
    requestTime,
    userId,
    isPublished,
    isOldEvent,
    pageNum: pageNum,
    pageSize: pageSize,
  })
  return NextResponse.json(
    { data: event.map((p) => p.event), total: count, pageSize, pageNum },
    { status: 200 }
  )
}
