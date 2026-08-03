'use server'

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { PaymentWithRelations } from '@/lib/types/payment'
import { UserInfoProps } from '@/lib/types/userInfo'
import { Prisma } from '@prisma/client'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Base function to fetch payments (without caching)
async function fetchPaymentsData(
  user: UserInfoProps,
  currentPage: number,
  pageSize: number,
  searchTerm: string = ''
) {
  return withDbRetry(async () => {
  const skip = Math.max(0, (currentPage - 1) * pageSize)
  const requiredCount = currentPage * pageSize + pageSize // Extra page as buffer
  const smartFetchLimit = Math.max(requiredCount * 2, 100) // *2 for filtering buffer

  let payments: PaymentWithRelations[]
  let totalCount: number

  const normalizedSearch = searchTerm.trim()
  const searchWhere: Prisma.PaymentWhereInput | undefined = normalizedSearch
    ? {
        OR: [
          { event: { is: { title: { contains: normalizedSearch, mode: 'insensitive' } } } },
          { user: { is: { email: { contains: normalizedSearch, mode: 'insensitive' } } } },
          { user: { is: { name: { contains: normalizedSearch, mode: 'insensitive' } } } },
          { guestEmail: { contains: normalizedSearch, mode: 'insensitive' } },
          { guestName: { contains: normalizedSearch, mode: 'insensitive' } },
        ],
      }
    : undefined

  if (user.role.includes('ADMIN') || user.role.includes('SUPERADMIN')) {
    // Admin: get all payments
    const where: Prisma.PaymentWhereInput = searchWhere ?? {}
    const [adminTotalCount, adminPayments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          pricePaid: true,
          totalRefundAmount: true,
          createdAt: true,
          type: true,
          expiresAt: true,
          quantity: true,
          method: true,
          refunded: true,
          stripePaymentId: true,
          seatNumber: true,
          guestName: true,
          guestEmail: true,
          note: true,
          user: {
            select: {
              name: true,
              email: true,
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
              keyName: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
          eventTicket: {
            select: {
              stripeProductId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: smartFetchLimit,
      }),
    ])
    totalCount = adminTotalCount
    payments = adminPayments as PaymentWithRelations[]
  } else if (user.role.includes('HOST')) {
    // Host: get payments for hosted events
    const hostedEvents = await prisma.event.findMany({
      where: {
        hosts: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
      },
    })

    const hostedEventIds = hostedEvents.map((event) => event.id)
    const where: Prisma.PaymentWhereInput = {
      AND: [
        {
          eventId: {
            in: hostedEventIds,
          },
        },
        ...(searchWhere ? [searchWhere] : []),
      ],
    }

    const [hostTotalCount, hostPayments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          pricePaid: true,
          totalRefundAmount: true,
          createdAt: true,
          type: true,
          expiresAt: true,
          quantity: true,
          method: true,
          refunded: true,
          stripePaymentId: true,
          note: true,
          user: {
            select: {
              name: true,
              email: true,
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
              keyName: true,
              startDate: true,
              endDate: true,
              location: true,
            },
          },
          eventTicket: {
            select: {
              stripeProductId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: smartFetchLimit,
      }),
    ])
    totalCount = hostTotalCount
    payments = hostPayments as PaymentWithRelations[]
  } else {
    return {
      payments: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      fetchedCount: 0,
    }
  }

  // Apply pagination
  const startIndex = skip
  const endIndex = startIndex + pageSize
  const paginatedPayments = payments.slice(startIndex, endIndex)
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    payments: paginatedPayments,
    totalCount,
    totalPages,
    currentPage,
    fetchedCount: payments.length,
  }
  }, { label: 'fetchPaymentsData' })
}

export const getPaginatedPayments = async (
  user: UserInfoProps,
  currentPage: number = 1,
  pageSize: number = 20,
  searchTerm: string = ''
): Promise<{
  payments: PaymentWithRelations[]
  totalCount: number
  totalPages: number
  currentPage: number
  fetchedCount: number
  isFromCache: boolean
  cacheReason?: string
}> => {
  // Create stable cache key from user properties
  const userRole = user.role[0] || 'USER'
  const userId = user.role.includes('HOST') ? user.id : 'all'
  const cacheKey = `payments-${userRole}-${userId}-${currentPage}-${pageSize}-${searchTerm.trim().toLowerCase()}`

  // Use unstable_cache with stable key
  const getCachedPaymentsData = unstable_cache(
    async () => fetchPaymentsData(user, currentPage, pageSize, searchTerm),
    [cacheKey], // stable cache key
    {
      tags: ['payments'], // tag for revalidation
      revalidate: 300, // 5 minutes default revalidation
    }
  )

  const result = await getCachedPaymentsData()

  return {
    ...result,
    isFromCache: true, // unstable_cache handles caching internally
    cacheReason: 'next-cache',
  }
}
