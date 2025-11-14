import { prisma } from '@/lib/db'
import { PaymentWithRelations } from '@/lib/types/payment'
import { UserInfoProps } from '@/lib/types/userInfo'
import {
  setPaymentCache,
  validatePaymentCacheForPage,
  getCachedPayments,
  getCachedTotalCount,
} from './paymentCache'

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
    const skip = Math.max(0, (currentPage - 1) * pageSize)
    const requiredCount = currentPage * pageSize + pageSize // Extra page as buffer
    const smartFetchLimit = Math.max(requiredCount * 2, 100) // *2 for filtering buffer

    // Check cache validity for current page
    const cacheValidation = validatePaymentCacheForPage(
      currentPage,
      pageSize,
      user.role[0] || 'USER',
      user.role.includes('HOST') ? user.id : undefined
    )

    let payments: PaymentWithRelations[]
    let totalCount: number
    let isFromCache = false
    const cacheReason = cacheValidation.reason

    if (cacheValidation.isValid) {
      // Use cached data
      payments = getCachedPayments()!
      totalCount = getCachedTotalCount()
      isFromCache = true
    } else {
      // Need to fetch fresh data
      console.log(`Fetching fresh payment data: ${cacheValidation.reason}`)
      
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
          isFromCache: false,
        }
      }

      // Update cache with fresh data
      setPaymentCache({
        data: payments,
        timestamp: Date.now(),
        userRole: user.role[0] || 'USER',
        userId: user.role.includes('HOST') ? user.id : undefined,
        fetchLimit: smartFetchLimit,
        totalCount,
      })

      console.log(`Fetched ${payments.length} payments with limit ${smartFetchLimit}`)
    }

    // Apply pagination to the fetched/cached data
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
      isFromCache,
      cacheReason,
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
