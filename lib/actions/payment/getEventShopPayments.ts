'use server'

import { unstable_cache } from 'next/cache'
import { canAccessEventPaymentData } from './canAccessEventPaymentData'

async function fetchEventShopPaymentsData(eventId: string) {
  const { prisma } = await import('@/lib/db')
  try {
    const payments = await prisma.payment.findMany({
      where: {
        refunded: false,
        shop: {
          eventId,
        },
      },
      select: {
        id: true,
        createdAt: true,
        pricePaid: true,
        quantity: true,
        method: true,
        type: true,
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        shop: {
          select: {
            id: true,
            title: true,
          },
        },
        shopItem: {
          select: {
            id: true,
            title: true,
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
    }))
  } catch (error) {
    console.error('Error fetching event shop payments:', error)
    throw error
  }
}

export async function getEventShopPayments(eventId: string) {
  if (!(await canAccessEventPaymentData(eventId))) {
    return []
  }

  const cachedFunction = unstable_cache(
    () => fetchEventShopPaymentsData(eventId),
    [`event-shop-payments-v1-${eventId}`],
    {
      revalidate: 86400,
      tags: ['payments', 'shops'],
    }
  )
  return await cachedFunction()
}
