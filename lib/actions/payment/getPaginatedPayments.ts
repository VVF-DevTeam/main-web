'use server'

import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { PaymentWithRelations } from '@/lib/types/payment'
import { UserInfoProps } from '@/lib/types/userInfo'

// Base function to fetch payments (without caching)
async function fetchPaymentsData(
  user: UserInfoProps,
  currentPage: number,
  pageSize: number
) {
  const skip = Math.max(0, (currentPage - 1) * pageSize)
  const requiredCount = currentPage * pageSize + pageSize // Extra page as buffer
  const smartFetchLimit = Math.max(requiredCount * 2, 100) // *2 for filtering buffer

  let payments: PaymentWithRelations[]
  let totalCount: number

  if (user.role.includes('ADMIN')) {
    // Admin: get all payments
    const [adminTotalCount, adminPayments] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.findMany({
        select: {
          id: true,
          pricePaid: true,
          createdAt: true,
          type: true,
          expiresAt: true,
          quantity: true,
          refunded: true,
          stripePaymentId: true,
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
    const where = {
      eventId: {
        in: hostedEventIds,
      },
    } as const

    const [hostTotalCount, hostPayments] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        select: {
          id: true,
          pricePaid: true,
          createdAt: true,
          type: true,
          expiresAt: true,
          quantity: true,
          refunded: true,
          stripePaymentId: true,
          user: {
            select: {
              name: true,
              email: true,
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
}

export const getPaginatedPayments = async (
  user: UserInfoProps,
  currentPage: number = 1,
  pageSize: number = 20
): Promise<{
  payments: PaymentWithRelations[]
  totalCount: number
  totalPages: number
  currentPage: number
  fetchedCount: number
  isFromCache: boolean
  cacheReason?: string
}> => {
  try {
    // Create stable cache key from user properties
    const userRole = user.role[0] || 'USER'
    const userId = user.role.includes('HOST') ? user.id : 'all'
    const cacheKey = `payments-${userRole}-${userId}-${currentPage}-${pageSize}`
    
    // Use unstable_cache with stable key
    const getCachedPaymentsData = unstable_cache(
      async () => fetchPaymentsData(user, currentPage, pageSize),
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
  } catch (error) {
    console.error('Error fetching paginated payments:', error)
    return {
      payments: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      fetchedCount: 0,
      isFromCache: false,
    }
  }
}
