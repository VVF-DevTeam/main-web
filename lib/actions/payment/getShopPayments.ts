'use server'

import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'

async function fetchShopPaymentsData(shopId: string) {
  const { prisma } = await import('@/lib/db')
  return withDbRetry(async () => {
    const payments = await prisma.payment.findMany({
      where: {
        refunded: false,
        shopId,
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
  }, { label: 'fetchShopPaymentsData' })
}

export async function getShopPayments(shopId: string) {
  const cachedFunction = unstable_cache(
    () => fetchShopPaymentsData(shopId),
    [`shop-payments-v1-${shopId}`],
    {
      revalidate: 86400,
      tags: ['payments', 'shops'],
    }
  )
  return await cachedFunction()
}
