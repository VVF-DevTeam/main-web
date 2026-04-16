'use server'

import { unstable_cache } from 'next/cache'

export const getAllReceipts = unstable_cache(
  async (canViewAll: boolean, userId: string) => {
    const { prisma } = await import('@/lib/db')
    try {
      const receipts = await prisma.receipt.findMany({
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
      })

      return receipts
    } catch (error) {
      console.error('Error getting receipts:', error)
      return []
    }
  },
  ['receipts-all'],
  {
    revalidate: 86400, // 1 day
    tags: ['receipts'],
  },
)
