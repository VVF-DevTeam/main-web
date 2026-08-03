'use server'

import { unstable_cache } from 'next/cache'
import { EventSeries } from '@prisma/client'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Cached version of getAllEventSeries
export const getAllEventSeries = unstable_cache(
  async (): Promise<EventSeries[]> => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.eventSeries.findMany({
          orderBy: {
            name: 'asc',
          },
        }),
      { label: 'getAllEventSeries' }
    )
  },
  ['event-series-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['series'], // Tag for revalidation (consistent with existing series cache)
  }
)
