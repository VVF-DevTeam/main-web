'use server'

import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'
import { canAccessEventPaymentData } from './canAccessEventPaymentData'

async function fetchEventRefundPaymentsData(eventId: string) {
  const { prisma } = await import('@/lib/db')
  return withDbRetry(async () => {
    const payments = await prisma.payment.findMany({
      where: {
        eventId,
        type: 'Refund',
      },
      select: {
        id: true,
        pricePaid: true,
        createdAt: true,
        quantity: true,
        seatNumber: true,
        type: true,
        method: true,
        stripePaymentId: true,
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        note: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        monitorUser: {
          select: {
            name: true,
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

    return payments.map((payment) => ({
      ...payment,
      pricePaid: Number(payment.pricePaid.toString()),
      eventTicket: payment.eventTicket
        ? {
            capacityPerTicket: payment.eventTicket.capacityPerTicket,
            type: payment.eventTicket.type,
          }
        : null,
    }))
  }, { label: 'fetchEventRefundPaymentsData' })
}

export async function getEventRefundPayments(eventId: string) {
  if (!(await canAccessEventPaymentData(eventId))) {
    return []
  }

  const cachedFunction = unstable_cache(
    () => fetchEventRefundPaymentsData(eventId),
    [`event-refund-payments-v1-${eventId}`],
    {
      revalidate: 86400,
      tags: ['payments'],
    }
  )
  return await cachedFunction()
}
