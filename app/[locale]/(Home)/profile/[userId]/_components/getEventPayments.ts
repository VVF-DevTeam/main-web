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
      capacityPerTicket: payment.eventTicket?.capacityPerTicket ?? 1,
    }))
  } catch (error) {
    console.error('Error fetching event payments:', error)
    throw error
  }
}

// Cached version of getEventPayments - cached per event
export async function getEventPayments(eventId: string) {
  const cachedFunction = unstable_cache(
    () => fetchEventPaymentsData(eventId),
    [`event-payments-${eventId}`], // Cache key per event
    {
      revalidate: 86400, // Cache for 1 day (revalidateTag handles on-demand invalidation)
      tags: ['payments'], // Tag for revalidation - will be invalidated when payments change
    }
  )
  return await cachedFunction()
}

