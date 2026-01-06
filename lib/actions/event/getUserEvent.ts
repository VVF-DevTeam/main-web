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
  try {
    console.log(isOldEvent)
    const user = await prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        name: true,
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
              days: true,
              endDate: true,
            },
          },
        },
        where: {
          user: { id: user.id },
          event: {
            isPublished,
            startDate: {
              gte: requestTime,
            },
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
          },
        },
      }),
    ])
  } catch (error) {
    console.error('Error getting user events:', error)
    return [[], 0] as const
  }
}
