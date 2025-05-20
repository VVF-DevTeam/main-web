import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
      const [events, total] = await Promise.all([
        prisma.event.findMany({
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            startDate: true,
            startTime: true,
            imgUrl: true,
            isPublished: true,
            eventType: true,
            capacity: true,
            ticketsSold: true,
            days: true,
            endDate: true,
          },
          where: {
            title: {
              contains: searchTitle,
              mode: 'insensitive',
            },
            ...(isPublished !== undefined && {
              isPublished: isPublished,
            }),
            endDate: {
              gte: requestTime,
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip: pageNum * pageSize,
          take: pageSize,
        }),
        prisma.event.count({
          where: {
            title: {
              contains: searchTitle,
              mode: 'insensitive',
            },
            ...(isPublished !== undefined && {
              isPublished: isPublished,
            }),
          },
        }),
      ])
      event = events.map((item) => ({
        ...item,
        remainingTicket: (item.capacity || 0) - (item.ticketsSold || 0),
      }))
      totalEvent = total
    } else {
      event = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          startDate: true,
          startTime: true,
          imgUrl: true,
          endTime: true,
          formLink: true,
          endDate: true,
          hosts: {
            select: {
              name: true,
            },
          },
          schedules: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              description: true,
            },
          },
        },
        where: {
          id: eventId,
          endDate: {
            gte: requestTime,
          },
        },
      })
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
