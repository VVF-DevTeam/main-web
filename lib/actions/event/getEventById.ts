'use server'

import { unstable_cache } from 'next/cache'

// Cached version to get event by ID (without time filter)
const getCachedEventById = unstable_cache(
  async (eventId: string) => {
    const { prisma } = await import('@/lib/db')
    return prisma.event.findUnique({
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
      },
    })
  },
  ['event-by-id'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)

// Main function with time filtering (maintains backward compatibility)
export const getEventById = async ({
  eventId,
  requestTime,
}: {
  eventId: string
  requestTime: Date
}) => {
  const event = await getCachedEventById(eventId)
  
  // Apply time filter after cache retrieval
  if (!event || new Date(event.endDate) < requestTime) {
    return null
  }
  
  return event
}
