'use server'

import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'

export const getAllReceipts = unstable_cache(
  async (canViewAll: boolean, userId: string) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.receipt.findMany({
          where: canViewAll ? {} : { userId },
          select: {
            id: true,
            receiptNumber: true,
            receiptDate: true,
            merchantName: true,
            merchantAddress: true,
            totalAmount: true,
            currency: true,
            subtotal: true,
            taxAmount: true,
            tipAmount: true,
            discountAmount: true,
            note: true,
            paymentMethod: true,
            paymentReference: true,
            hasReimbursed: true,
            category: true,
            receiptImageUrl: true,
            rawText: true,
            items: {
              select: {
                id: true,
                description: true,
                quantity: true,
                unitPrice: true,
                taxAmount: true,
                discount: true,
                lineTotal: true,
              },
            },
          },
          orderBy: { receiptDate: 'desc' },
        }),
      { label: 'getAllReceipts' }
    )
  },
  ['receipts-all'],
  {
    revalidate: 86400, // 1 day
    tags: ['receipts'],
  },
)
