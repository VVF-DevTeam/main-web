'use server'

import { unstable_cache } from 'next/cache'
import { EventCategory } from '@prisma/client'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Cached version of getAllEventCategories
export const getAllEventCategories = unstable_cache(
  async (): Promise<EventCategory[]> => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.eventCategory.findMany({
          orderBy: {
            title: 'asc',
          },
        }),
      { label: 'getAllEventCategories' }
    )
  },
  ['event-categories-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['event-categories'], // Tag for revalidation
  }
)
