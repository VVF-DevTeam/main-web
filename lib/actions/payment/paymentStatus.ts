import { PaymentType } from '@prisma/client'

export type PaymentStatus = 'Active' | 'Expired' | 'Upcoming' | 'Ongoing' | 'Past' | 'Refunded'

export const getPaymentStatus = (
  payment: {
    type: PaymentType
    createdAt: Date
    expiresAt: Date | null
    refunded: boolean
    event?: {
      startDate: Date | null
      endDate: Date
    } | null
  }
): PaymentStatus => {
  if (payment.refunded) {
    return 'Refunded'
  }

  const startDate = new Date(
    payment.type === 'Membership'
      ? payment.createdAt
      : payment.event?.startDate || payment.createdAt
  )
  const endDate = new Date(
    payment.type === 'Membership'
      ? payment.expiresAt!
      : payment.event?.endDate || payment.createdAt
  )

  if (payment.type === 'Membership') {
    return new Date() < endDate ? 'Active' : 'Expired'
  }

  if (new Date() < startDate) {
    return 'Upcoming'
  }
  if (new Date() < endDate) {
    return 'Ongoing'
  }
  return 'Past'
}

export const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'Active':
    case 'Ongoing':
      return 'text-green-600'
    case 'Upcoming':
      return 'text-textColor-blue'
    case 'Expired':
    case 'Past':
      return 'text-red-600'
    case 'Refunded':
      return 'text-gray-600'
    default:
      return ''
  }
} 