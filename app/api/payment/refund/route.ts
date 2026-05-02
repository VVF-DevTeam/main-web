import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'
import { sendRefundConfirmationEmail } from '@/lib/actions/email/sendRefundConfirmationEmail'
import { revalidateTag } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    // Check if user is authenticated and is an admin
    if (!session?.user || !(session.user.role?.includes('ADMIN') || session.user.role?.includes('SUPERADMIN'))) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { paymentId } = await req.json()

    if (!paymentId) {
      return new NextResponse('Missing paymentId', { status: 400 })
    }

    // Get payment details from database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        stripePaymentId: true,
        type: true,
        eventId: true,
        userId: true,
        eventTicketId: true,
        quantity: true,
        refunded: true, // Check if already refunded
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

    // Process refund through Stripe
    // If amount is not specified, Stripe will refund the full amount automatically
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
    })

    // If it's a Membership payment, cancel the subscription immediately
    if (payment.type === 'Membership' && payment.user?.stripeSubscriptionId) {
      try {
        // Cancel the subscription immediately (not at period end)
        await stripe.subscriptions.cancel(payment.user.stripeSubscriptionId)
        
        // Update user's subscription status in database
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
        // Continue with refund even if subscription cancellation fails
        // Log the error but don't fail the entire refund process
      }
    }

    // Update payment in database
    // For membership refunds, also nullify expiresAt to maintain data consistency
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        updatedAt: new Date(),
        refunded: true,
        // If it's a membership payment, nullify expiresAt since subscription is cancelled
        ...(payment.type === 'Membership' && { expiresAt: null }),
      },
    })

    // Revalidate payment cache after updating payment
    revalidateTag('payments')

    // Send refund confirmation email to the user (best-effort, non-blocking for failure)
    if (payment.user?.email) {
      try {
        const firstName =
          payment.user.name?.split(' ')[0] || 'Valued Customer'

        const refundedAmount =
          typeof refund.amount === 'number' ? refund.amount / 100 : 0

        const ticketType =
          payment.type === 'Membership'
            ? 'Membership Subscription'
            : 'Event Ticket'

        await sendRefundConfirmationEmail({
          firstName,
          to: payment.user.email,
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
    if (payment.type !== 'Membership' && payment.eventId && payment.userId) {
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