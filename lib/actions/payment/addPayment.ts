'use server'
import { prisma } from '@/lib/db'
import { PaymentType } from '@prisma/client'

interface AddPaymentParams {
  eventId?: string | null
  userId: string
  pricePaid: number
  quantity: number
  paymentMethod: string
  paymentType: string
}

export async function addPayment({
  eventId,
  userId,
  pricePaid,
  quantity,
  paymentMethod,
  paymentType,
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
        stripeProductId: paymentMethod,
        stripePriceId: paymentMethod,
        type: paymentType as PaymentType,
      },
    })

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
