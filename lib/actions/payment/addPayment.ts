'use server'
import { prisma } from '@/lib/db'
import { PaymentMethod, PaymentType } from '@prisma/client'
import { revalidateTag } from 'next/cache'

interface AddPaymentParams {
  eventId?: string | null
  eventTicketId?: string
  userId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  pricePaid: number
  quantity: number
  paymentMethod: string
  paymentType: string
  membershipEndDate?: Date | null
  note?: string
}

export async function addPayment({
  eventId,
  eventTicketId,
  userId,
  guestName,
  guestEmail,
  guestPhone,
  pricePaid,
  quantity,
  paymentMethod,
  paymentType,
  membershipEndDate,
  note,
}: AddPaymentParams) {
  try {
    if (eventId === 'none') {
      eventId = null
    }

    const payment = await prisma.payment.create({
      data: {
        eventId,
        eventTicketId: eventTicketId || null,
        userId: userId || null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        pricePaid,
        quantity,
        method: paymentMethod as PaymentMethod,
        type: paymentType as PaymentType,
        expiresAt: membershipEndDate,
        note: note || null,
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
