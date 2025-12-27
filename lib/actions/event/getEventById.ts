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

// Cached version to get event by keyName with full relations
// This ensures the query only runs once per request, even if called from both
// generateMetadata and the page component
export const getEventByKeyName = unstable_cache(
  async (eventKeyName: string) => {
    const { prisma } = await import('@/lib/db')
    return await prisma.event.findUnique({
      where: {
        keyName: eventKeyName,
      },
      include: {
        schedules: true,
        categories: true,
        hosts: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            Review: true,
          },
        },
        series: {
          select: {
            id: true,
          },
        },
        tickets: true,
        sponsors: {
          include: {
            sponsor: true,
          },
          orderBy: [
            { tier: 'asc' },
            { order: 'asc' },
          ],
        },
      },
    })
  },
  ['event-by-keyname'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)
