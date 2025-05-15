import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.role?.includes('ADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { paymentId, amount } = await req.json()

    if (!paymentId || !amount) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Get payment details from database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        stripePaymentId: true,
        type: true,
        eventId: true,
        userId: true,
      },
    })

    if (!payment) {
      return new NextResponse('Payment not found', { status: 404 })
    }

    if (!payment.stripePaymentId) {
      return new NextResponse('No Stripe payment ID found', { status: 400 })
    }

    // Process refund through Stripe    
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
      amount: Math.round(amount * 100), // Convert to cents
    })

    // Update payment in database
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        updatedAt: new Date(),
        refunded: true,
      },
    })

    // If it's an event payment, remove the user from the event
    if (payment.type !== 'Membership' && payment.eventId) {
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