'use server'
import { prisma } from '@/lib/db'
import { PaymentType } from '@prisma/client'
import { revalidateTag } from 'next/cache'

interface AddPaymentParams {
  eventId?: string | null
  userId: string
  pricePaid: number
  quantity: number
  paymentMethod: string
  paymentType: string
  membershipEndDate?: Date | null
}

export async function addPayment({
  eventId,
  userId,
  pricePaid,
  quantity,
  paymentMethod,
  paymentType,
  membershipEndDate,
}: AddPaymentParams) {
  try {
    if (eventId === 'none') {
      eventId = null
    }

    const payment = await prisma.payment.create({
      data: {
        eventId,
        userId,
        pricePaid,
        quantity,
        stripePaymentId: paymentMethod,
        type: paymentType as PaymentType,
        expiresAt: membershipEndDate,
      },
    })

    // Revalidate payment cache after creating new payment
    revalidateTag('payments')

    return {
      success: true,
      message: 'Payment added successfully',
      payment,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: 'Failed to add payment. Error: ' + error,
    }
  }
}
