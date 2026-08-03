'use server'

import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Cached version to get event tickets by event ID
const getCachedEventTickets = unstable_cache(
  async (eventId: string) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(async () => {
      const tickets = await prisma.eventTicket.findMany({
        where: {
          eventId: eventId,
        },
        select: {
          id: true,
          type: true,
          price: true,
        },
        orderBy: {
          price: 'asc',
        },
      })

      // Convert Decimal to number for client consumption
      return tickets.map((ticket) => ({
        id: ticket.id,
        type: ticket.type,
        price: Number(ticket.price),
      }))
    }, { label: 'getCachedEventTickets' })
  },
  ['event-tickets-by-event'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation (tickets are part of events)
  }
)

export interface EventTicket {
  id: string
  type: string
  price: number
}

/**
 * Get all tickets for a specific event
 * @param eventId - The ID of the event
 * @returns Array of event tickets with id, type, and price (as number)
 */
export const getEventTickets = async (eventId: string): Promise<EventTicket[]> => {
  if (!eventId || eventId === 'none') {
    return []
  }

  return await getCachedEventTickets(eventId)
}
