import { prisma } from '@/lib/db'

export const getEventPagiation = async ({
  searchTitle,
  isPublished,
  requestTime,
  pageNum,
  pageSize,
}: {
  searchTitle: string | undefined
  isPublished: boolean | undefined
  requestTime: Date
  pageNum: number
  pageSize: number
}) => {
  return Promise.all([
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
        isPublished: isPublished,
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
        isPublished: isPublished,
      },
    }),
  ])
}
