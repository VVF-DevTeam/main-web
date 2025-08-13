import { PaymentWithRelations } from '@/lib/types/payment'

// Cache structure for payments
type PaymentCache = {
  data: PaymentWithRelations[]
  timestamp: number
  userRole: string
  userId?: string // For HOST role to cache their specific hosted events
  fetchLimit?: number
  totalCount: number
}

// In-memory cache for payments
let paymentsCache: PaymentCache | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const getPaymentCache = () => paymentsCache

export const setPaymentCache = (cache: PaymentCache) => {
  paymentsCache = cache
}

export const clearPaymentCache = () => {
  paymentsCache = null
}

export const isPaymentCacheValid = (
  userRole: string,
  userId?: string,
  requiredCount?: number
): boolean => {
  if (!paymentsCache) return false

  const now = Date.now()
  const isExpired = now - paymentsCache.timestamp > CACHE_DURATION
  const isSameRole = paymentsCache.userRole === userRole
  const isSameUser = userRole === 'HOST' ? paymentsCache.userId === userId : true
  const hasEnoughData = requiredCount ? paymentsCache.data.length >= requiredCount : true

  return !isExpired && isSameRole && isSameUser && hasEnoughData
}

export const getCachedPayments = (): PaymentWithRelations[] | null => {
  return paymentsCache?.data || null
}

export const getCachedTotalCount = (): number => {
  return paymentsCache?.totalCount || 0
}

// Cache invalidation triggers
export const invalidatePaymentCache = () => {
  clearPaymentCache()
}

// Smart cache validation for pagination
export const validatePaymentCacheForPage = (
  currentPage: number,
  pageSize: number,
  userRole: string,
  userId?: string
): { isValid: boolean; reason?: string } => {
  if (!paymentsCache) {
    return { isValid: false, reason: 'no cache' }
  }

  const now = Date.now()
  if (now - paymentsCache.timestamp > CACHE_DURATION) {
    return { isValid: false, reason: 'cache expired' }
  }

  if (paymentsCache.userRole !== userRole) {
    return { isValid: false, reason: 'different user role' }
  }

  if (userRole === 'HOST' && paymentsCache.userId !== userId) {
    return { isValid: false, reason: 'different host user' }
  }

  const requiredCount = currentPage * pageSize + pageSize // Extra page as buffer
  if (paymentsCache.data.length < requiredCount) {
    return { isValid: false, reason: `insufficient cached data (have: ${paymentsCache.data.length}, need: ${requiredCount})` }
  }

  return { isValid: true }
}
