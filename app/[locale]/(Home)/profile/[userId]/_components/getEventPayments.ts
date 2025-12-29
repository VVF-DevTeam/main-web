'use server'

import { unstable_cache } from 'next/cache'

// Base function to fetch event payments (without caching)
async function fetchEventPaymentsData(eventId: string) {
  const { prisma } = await import('@/lib/db')
  try {
    const payments = await prisma.payment.findMany({
      where: {
        eventId: eventId,
        refunded: false, // Only count non-refunded payments
      },
      select: {
        id: true,
        pricePaid: true,
        quantity: true,
        seatNumber: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            keyName: true,
          },
        },
        eventTicket: {
          select: {
            capacityPerTicket: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    // Convert Decimal to number for client-side compatibility
    return payments.map((payment) => ({
      ...payment,
      pricePaid: Number(payment.pricePaid.toString()),
      // Map eventTicket to ensure proper structure
      eventTicket: payment.eventTicket
        ? {
            capacityPerTicket: payment.eventTicket.capacityPerTicket,
            type: payment.eventTicket.type,
          }
        : null,
    }))
  } catch (error) {
    console.error('Error fetching event payments:', error)
    throw error
  }
}

// Cached version of getEventPayments - cached per event
// Note: If you change the query structure (add/remove fields), increment the cache key version
// (e.g., v2 → v3) to force a cache refresh, otherwise wait for:
// 1. Cache expiration (1 day) or 2. Tag revalidation (when payments are created/refunded)
export async function getEventPayments(eventId: string) {
  const cachedFunction = unstable_cache(
    () => fetchEventPaymentsData(eventId),
    [`event-payments-v2-${eventId}`], // Cache key per event (v2 after adding type field)
    {
      revalidate: 86400, // Cache for 1 day (revalidateTag handles on-demand invalidation)
      tags: ['payments'], // Tag for revalidation - automatically invalidated when payments change
    }
  )
  return await cachedFunction()
}
