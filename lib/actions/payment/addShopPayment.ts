'use server'

import { prisma } from '@/lib/db'
import { PaymentMethod, PaymentType } from '@prisma/client'
import { revalidateTag } from 'next/cache'

interface AddShopPaymentParams {
  shopId: string
  shopItemId?: string
  userId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  pricePaid: number
  quantity: number
  paymentMethod: string
}

export async function addShopPayment({
  shopId,
  shopItemId,
  userId,
  guestName,
  guestEmail,
  guestPhone,
  pricePaid,
  quantity,
  paymentMethod,
}: AddShopPaymentParams) {
  try {
    const payment = await prisma.payment.create({
      data: {
        shopId,
        shopItemId: shopItemId || null,
        userId: userId || null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        pricePaid,
        quantity,
        method: paymentMethod as PaymentMethod,
        type: PaymentType.Shop,
      },
    })

    revalidateTag('payments')
    revalidateTag('shops')

    return {
      success: true,
      message: 'Shop payment added successfully',
      payment,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      message: 'Failed to add shop payment. Error: ' + error,
    }
  }
}
