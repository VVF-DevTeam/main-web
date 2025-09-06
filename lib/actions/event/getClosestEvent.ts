'use server'

import { prisma } from '@/lib/db'

export async function getClosestFutureEvent() {
  try {
    const now = new Date()
    
    const closestEvent = await prisma.event.findFirst({
      where: {
        isPublished: true,
        startDate: {
          gte: now, // Events that start in the future
        },
      },
      select: {
        id: true,
        title: true,
        keyName: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        eventType: true,
      },
      orderBy: {
        startDate: 'asc', // Get the closest one first
      },
    })

    return closestEvent
  } catch (error) {
    console.error('Error getting closest future event:', error)
    return null
  }
}
