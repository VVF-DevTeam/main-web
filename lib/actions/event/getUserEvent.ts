import { prisma } from '@/lib/db'

export const getUserEvents = async ({
  userId,
  isPublished,
  isOldEvent,
  pageNum,
  pageSize,
  requestTime,
}: {
  userId: string
  isPublished: boolean | undefined
  isOldEvent: boolean
  pageNum: number
  pageSize: number
  requestTime: Date
}) => {
  const user = await prisma.user.findUniqueOrThrow({
    select: {
      id: true,
    },
    where: {
      id: userId,
    },
  })

  return Promise.all([
    prisma.payment.findMany({
      select: {
        event: {
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
        },
      },
      where: {
        user: { is: { id: user.id } },
        event: {
          isPublished,
          ...(isOldEvent
            ? { endDate: { gte: requestTime } }
            : { endDate: { lte: requestTime } }),
        },
      },
      skip: pageNum * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({
      where: {
        user: user,
        event: {
          isPublished,
          ...(isOldEvent
            ? { endDate: { gte: requestTime } }
            : { endDate: { lte: requestTime } }),
        },
      },
    }),
  ])
}
