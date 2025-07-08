import { prisma } from '@/lib/db'

export const getEventById = async ({
  eventId,
  requestTime,
}: {
  eventId: string
  requestTime: Date
}) =>
  prisma.event.findUnique({
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
