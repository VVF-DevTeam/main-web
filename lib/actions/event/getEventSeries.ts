'use server'

import { unstable_cache } from 'next/cache'
import { EventSeries } from '@prisma/client'

// Cached version of getAllEventSeries
export const getAllEventSeries = unstable_cache(
  async (): Promise<EventSeries[]> => {
    const { prisma } = await import('@/lib/db')
    try {
      const series = await prisma.eventSeries.findMany({
        orderBy: {
          name: 'asc',
        },
      })
      return series
    } catch (error) {
      console.error('Error getting event series:', error)
      return []
    }
  },
  ['event-series-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['series'], // Tag for revalidation (consistent with existing series cache)
  }
)

