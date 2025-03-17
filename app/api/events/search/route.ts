import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export const GET = async (req: NextRequest) => {
  const searchText = req.nextUrl?.searchParams.get('searchText')
  const pageNum = Number(req?.nextUrl?.searchParams.get('pageNum')) || 0
  const pageSize = Number(req?.nextUrl?.searchParams.get('pageSize')) || 4

  if (!searchText)
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })

  try {
    let event = null
    let totalEvent = 0
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
        where: {},
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
    return NextResponse.json(
      { data: event, total: totalEvent, pageSize, pageNum },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}
