'use server'

import { unstable_cache } from 'next/cache'

// Cached version of getEventPagination
// Note: Time filtering is applied after cache retrieval to ensure fresh data
export const getCachedEventPagination = unstable_cache(
  async ({
    searchTitle,
    isPublished,
    pageNum,
    pageSize,
  }: {
    searchTitle: string | undefined
    isPublished: boolean | undefined
    pageNum: number
    pageSize: number
  }) => {
    const { prisma } = await import('@/lib/db')
    try {
      return Promise.all([
        prisma.event.findMany({
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            startTime: true,
            imgUrl: true,
            isPublished: true,
            eventType: true,
            capacity: true,
            days: true,
            endDate: true,
            keyName: true,
            tickets: {
              select: {
                id: true,
                type: true,
                price: true,
              },
            },
          },
          where: {
            title: {
              contains: searchTitle,
              mode: 'insensitive',
            },
            isPublished: isPublished,
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
    } catch (error) {
      console.error('Error getting event pagination:', error)
      return [[], 0] as const
    }
  },
  ['events-pagination'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour (shorter due to time-based filtering)
    tags: ['events'], // Tag for revalidation
  }
)

// Wrapper function to maintain backward compatibility with time filtering
export const getEventPagination = async ({
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
  try {
    const [events, total] = await getCachedEventPagination({
      searchTitle,
      isPublished,
      pageNum,
      pageSize,
    })

    // Apply time filter after cache retrieval
    const filteredEvents = events.filter(
      (event) => new Date(event.endDate) >= requestTime
    )

    return [filteredEvents, total] as const
  } catch (error) {
    console.error('Error in getEventPagination wrapper:', error)
    return [[], 0] as const
  }
}
