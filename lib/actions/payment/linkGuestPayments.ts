'use server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

/**
 * Links guest payments to a user account when they sign up or sign in
 * This function finds all payments with matching email where userId is null
 * and updates them to link to the user
 */
export async function linkGuestPaymentsToUser(userId: string, email: string) {
  try {
    // Find all guest payments (userId is null) with matching email
    const guestPayments = await prisma.payment.findMany({
      where: {
        userId: null,
        guestEmail: email.toLowerCase().trim(),
      },
    })

    if (guestPayments.length === 0) {
      return {
        success: true,
        message: 'No guest payments found to link',
        linkedCount: 0,
      }
    }

    // Update all guest payments to link to the user
    const result = await prisma.payment.updateMany({
      where: {
        id: {
          in: guestPayments.map((p) => p.id),
        },
      },
      data: {
        userId: userId,
        // Optionally clear guest fields after linking (or keep them for historical record)
        // guestName: null,
        // guestEmail: null,
        // guestPhone: null,
      },
    })

    // Revalidate payment cache after linking payments
    revalidateTag('payments')

    return {
      success: true,
      message: `Successfully linked ${result.count} payment(s) to user account`,
      linkedCount: result.count,
    }
  } catch (error) {
    console.error('[LINK_GUEST_PAYMENTS_ERROR]', error)
    return {
      success: false,
      message: 'Failed to link guest payments. Error: ' + error,
      linkedCount: 0,
    }
  }
}


