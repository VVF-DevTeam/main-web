'use server'

import { unstable_cache } from 'next/cache'
import { EventSponsor, SponsorTier } from '@prisma/client'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Type matching what SponsorsManager expects
type SponsorOnEventWithEvent = {
  eventId: string
  tier: SponsorTier
  order: number | null
  event: {
    id: string
    title: string
  }
}

type SponsorWithEvents = EventSponsor & {
  events: SponsorOnEventWithEvent[]
}

// Cached version of getAllEventSponsors with events
export const getAllEventSponsors = unstable_cache(
  async (): Promise<SponsorWithEvents[]> => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.eventSponsor.findMany({
          orderBy: {
            name: 'asc',
          },
          include: {
            events: {
              select: {
                eventId: true,
                tier: true,
                order: true,
                event: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: {
                tier: 'asc',
              },
            },
          },
        }),
      { label: 'getAllEventSponsors' }
    )
  },
  ['event-sponsors-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['event-sponsors'], // Tag for revalidation
  }
)
