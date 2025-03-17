import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const GET = async (request: NextRequest) => {
  const eventId = request?.nextUrl?.searchParams.get('eventId')
  const pageNum = Number(request?.nextUrl?.searchParams.get('pageNum')) || 0
  const pageSize = Number(request?.nextUrl?.searchParams.get('pageSize')) || 4

  let event = null
  let totalEvent = 0

  try {
    if (!eventId) {
      // Get all published events
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
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip: pageNum * pageSize,
          take: pageSize,
        }),
        prisma.event.count(),
      ])
      event = events
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
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}
