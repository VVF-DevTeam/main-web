'use server'

export async function getPublishedEvents() {
  const { prisma } = await import('@/lib/db')
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
      },
    })

    return events
  } catch (error) {
    console.error('Error getting published events:', error)
    return []
  }
}

export async function getEventParticipants(eventId: string) {
  const { prisma } = await import('@/lib/db')
  try {
    const participants = await prisma.payment.findMany({
      where: {
        eventId: eventId,
      },
    })
    return participants
  } catch (error) {
    console.error('Error getting event participants:', error)
    return []
  }
}

export async function getAllEventParticipants() {
  const { prisma } = await import('@/lib/db')
  try {
    const participants = await prisma.payment.findMany({
      where: {
        type: {
          not: 'Membership',
        },
        refunded: false,
        userId: {
          not: null,
        },
        eventId: {
          not: null,
        },
        user: {
          isNot: null,
        },
      },
      distinct: ['userId', 'eventId'],
      select: {
        userId: true,
        eventId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
    return participants
  } catch (error) {
    console.error('Error getting all event participants:', error)
    return []
  }
}

export async function getEventsOfHost(userId: string) {
  const { prisma } = await import('@/lib/db')
  try {
    const hosts = await prisma.event.findMany({
        where: {
          hosts: {
            some: {
              id: userId,
            },
          },
        },
        select: {
          id: true,
          title: true,
        },
      })
    return hosts
  } catch (error) {
    console.error('Error getting events of host:', error)
    return []
  }
}