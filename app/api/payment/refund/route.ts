import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import Stripe from 'stripe'
import { sendRefundConfirmationEmail } from '@/lib/actions/email/sendRefundConfirmationEmail'
import { revalidateTag } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

function isAdminRole(roles: Role[]) {
  return roles.some((r) => r === Role.ADMIN || r === Role.SUPERADMIN)
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { paymentId, amount, monitorUserId, note } = await req.json()

    if (!paymentId) {
      return new NextResponse('Missing paymentId', { status: 400 })
    }

    if (
      typeof monitorUserId !== 'string' ||
      !monitorUserId.trim() ||
      monitorUserId !== session.user.id
    ) {
      return new NextResponse('Invalid or missing monitorUserId', { status: 403 })
    }

    const initiator = await prisma.user.findUnique({
      where: { id: monitorUserId },
      select: { role: true },
    })

    if (!initiator || !isAdminRole(initiator.role)) {
      return new NextResponse('Forbidden: initiator must be Admin or SuperAdmin', {
        status: 403,
      })
    }

    // Get payment details from database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        stripePaymentId: true,
        pricePaid: true,
        type: true,
        eventId: true,
        userId: true,
        eventTicketId: true,
        quantity: true,
        refunded: true, // Check if already refunded
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        user: {
          select: {
            stripeSubscriptionId: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
    })

    if (!payment) {
      return new NextResponse('Payment not found', { status: 404 })
    }

    if (!payment.stripePaymentId) {
      return new NextResponse('No Stripe payment ID found', { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentId)
    const existingRefunds = await stripe.refunds.list({
      payment_intent: payment.stripePaymentId,
      limit: 100,
    })
    const alreadyRefundedInCents = existingRefunds.data
      .filter((item) => item.status !== 'failed' && item.status !== 'canceled')
      .reduce((total, item) => total + item.amount, 0)

    const totalPaidInCents =
      paymentIntent.amount_received || paymentIntent.amount || Math.round(Number(payment.pricePaid) * 100)
    const remainingRefundableInCents = Math.max(totalPaidInCents - alreadyRefundedInCents, 0)

    if (remainingRefundableInCents === 0) {
      return new NextResponse('Payment is already fully refunded', { status: 400 })
    }

    let refundAmountInCents: number | undefined
    if (amount !== undefined && amount !== null) {
      const parsedAmount = Number(amount)
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return new NextResponse('Invalid refund amount', { status: 400 })
      }
      refundAmountInCents = Math.round(parsedAmount * 100)

      if (refundAmountInCents > remainingRefundableInCents) {
        return new NextResponse('Refund amount exceeds remaining refundable amount', {
          status: 400,
        })
      }
    }

    // Process refund through Stripe
    // If amount is not specified, Stripe will refund the full amount automatically
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
      ...(refundAmountInCents ? { amount: refundAmountInCents } : {}),
    })

    const totalRefundedAfterThisRefund = alreadyRefundedInCents + refund.amount
    const isFullRefund = totalRefundedAfterThisRefund >= totalPaidInCents

    // If it's a full Membership refund, cancel subscription immediately
    if (isFullRefund && payment.type === 'Membership' && payment.user?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(payment.user.stripeSubscriptionId)

        if (payment.userId) {
          await prisma.user.update({
            where: { id: payment.userId },
            data: {
              stripeSubscriptionId: null,
              subscribeExpires: null,
              subscribedAt: null,
            },
          })
        }
      } catch (subscriptionError) {
        console.error('Error cancelling subscription:', subscriptionError)
      }
    }

    // Update payment in database
    // For full membership refunds, nullify expiresAt to maintain data consistency
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        updatedAt: new Date(),
        refunded: isFullRefund,
        totalRefundAmount: totalRefundedAfterThisRefund / 100,
        monitorUserId,
        ...(payment.type === 'Membership' && isFullRefund && { expiresAt: null }),
      },
    })

    // Add a new payment record for the refund
    await prisma.payment.create({
      data: {
        type: 'Refund',
        pricePaid: refund.amount / 100,
        quantity: payment.quantity || 1,
        method: 'Stripe',
        refunded: true,
        userId: payment.userId,
        guestName: payment.guestName,
        guestEmail: payment.guestEmail,
        guestPhone: payment.guestPhone,
        monitorUserId,
        eventId: payment.eventId,
        eventTicketId: payment.eventTicketId,
        note: typeof note === 'string' && note.trim() ? note.trim() : null,
      },
    })
    
    // Revalidate payment cache after updating payment
    revalidateTag('payments')

    // Send refund confirmation email (registered user or guest checkout)
    const refundRecipientEmail = (payment.user?.email || payment.guestEmail || '').trim()
    if (refundRecipientEmail) {
      try {
        const displayName = payment.user?.name || payment.guestName
        const firstName = displayName?.split(' ')[0] || 'Valued Customer'

        const refundedAmount =
          typeof refund.amount === 'number' ? refund.amount / 100 : 0

        const ticketType =
          payment.type === 'Membership'
            ? 'Membership Subscription'
            : 'Event Ticket'

        await sendRefundConfirmationEmail({
          firstName,
          to: refundRecipientEmail,
          ticketType,
          refundedAmount,
          currency: 'CAD',
          eventTitle: payment.event?.title,
          eventStartDate: payment.event?.startDate || null,
          eventEndDate: payment.event?.endDate || null,
          eventLocation: payment.event?.location || null,
        })
      } catch (emailError) {
        console.error('[REFUND_CONFIRMATION_EMAIL_ERROR]', emailError)
      }
    }

    // If it's an event payment, remove the user from the event
    // If user has deleted their account, no need to disconnect them from the event
    if (isFullRefund && payment.type !== 'Membership' && payment.eventId && payment.userId) {
      await prisma.event.update({
        where: { id: payment.eventId },
        data: {
          hosts: {
            disconnect: {
              id: payment.userId,
            },
          },
        },
      })
    }

    return NextResponse.json({ success: true, refund })
  } catch (error) {
    console.error('Refund error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 