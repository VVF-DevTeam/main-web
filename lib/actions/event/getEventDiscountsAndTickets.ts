'use server'

import { unstable_cache } from 'next/cache'

// Cached function to get event discounts and tickets for checkout
// Used in checkout session creation to calculate discounts
export const getEventDiscountsAndTickets = unstable_cache(
  async (eventId: string) => {
    const { prisma } = await import('@/lib/db')
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          eventDiscounts: true,
          tickets: {
            select: {
              id: true,
              price: true,
              discountMemberPercent: true,
              capacityPerTicket: true,
              payTotalNumber: true,
              limit: true,
            },
          },
        },
      })
      return event
    } catch (error) {
      console.error('Error getting event discounts and tickets:', error)
      return null
    }
  },
  ['event-discounts-tickets'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)

