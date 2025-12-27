import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

// Retrieve an EventTicket by id
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')

    if (!ticketId) {
      return new NextResponse('Ticket id is required', { status: 400 })
    }

    const ticket = await prisma.eventTicket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
      },
    })

    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    if (error instanceof Error) {
      console.log('[GET EVENT TICKET ERROR]: ', error.stack)
    } else {
      console.log('[GET EVENT TICKET ERROR]: ', error)
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Create an EventTicket
export const POST = async (request: Request) => {
  try {
    const {
      eventId,
      type,
      price,
      capacity,
      currency,
      discountMemberPercent,
      validFrom,
      validTo,
      stripeProductId,
      stripePriceId,
      subscribedStripePriceId,
      payTotalNumber,
    } = await request.json()

    // Ensure the related event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })
    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    const ticket = await prisma.eventTicket.create({
      data: {
        eventId,
        type,
        price,
        capacity,
        currency: currency || 'CAD',
        discountMemberPercent:
          discountMemberPercent !== undefined && discountMemberPercent !== null
            ? Math.round(Number(discountMemberPercent))
            : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        stripeProductId,
        stripePriceId,
        subscribedStripePriceId: subscribedStripePriceId || null,
        payTotalNumber:
          payTotalNumber !== undefined && payTotalNumber !== null
            ? Math.round(Number(payTotalNumber))
            : null,
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(ticket)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate unique field
        return new NextResponse(
          'Duplicate ticket data violates a unique constraint.',
          {
            status: 409,
          }
        )
      }
    }

    if (error instanceof Error) {
      console.log('[CREATE EVENT TICKET ERROR]: ', error.stack)
    } else {
      console.log('[CREATE EVENT TICKET ERROR]: ', error)
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Update an EventTicket
export const PUT = async (request: Request) => {
  try {
    const {
      id, // EventTicket id (required for update)
      ...values
    } = await request.json()

    if (!id) {
      return new NextResponse('Ticket id is required', { status: 400 })
    }

    const existing = await prisma.eventTicket.findUnique({
      where: { id },
    })
    if (!existing) {
      return new NextResponse('Ticket not found', { status: 404 })
    }

    const {
      validFrom,
      validTo,
      currency,
      discountMemberPercent,
      subscribedStripePriceId,
      price,
      payTotalNumber,
      ...rest
    } = values as {
      validFrom?: string | Date | null
      validTo?: string | Date | null
      currency?: string
      discountMemberPercent?: number | null
      subscribedStripePriceId?: string | null
      price?: number
      payTotalNumber?: number | null
      [key: string]: unknown
    }

    const updated = await prisma.eventTicket.update({
      where: { id },
      data: {
        ...rest,
        ...(price !== undefined && { price: price }),
        currency: currency ?? existing.currency,
        discountMemberPercent:
          discountMemberPercent !== undefined
            ? discountMemberPercent !== null
              ? Math.round(Number(discountMemberPercent))
              : null
            : existing.discountMemberPercent,
        subscribedStripePriceId:
          subscribedStripePriceId !== undefined
            ? subscribedStripePriceId ?? null
            : existing.subscribedStripePriceId,
        payTotalNumber:
          payTotalNumber !== undefined
            ? payTotalNumber !== null
              ? Math.round(Number(payTotalNumber))
              : null
            : existing.payTotalNumber,
        validFrom: validFrom
          ? new Date(validFrom)
          : validFrom === null
            ? null
            : existing.validFrom,
        validTo: validTo
          ? new Date(validTo)
          : validTo === null
            ? null
            : existing.validTo,
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate unique field
        return new NextResponse(
          'Duplicate ticket data violates a unique constraint.',
          {
            status: 409,
          }
        )
      }
    }

    if (error instanceof Error) {
      console.log('[UPDATE EVENT TICKET ERROR]: ', error.stack)
    } else {
      console.log('[UPDATE EVENT TICKET ERROR]: ', error)
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Delete an EventTicket
export const DELETE = async (request: Request) => {
  try {
    const { id } = await request.json()

    if (!id) {
      return new NextResponse('Ticket id is required', { status: 400 })
    }

    const existing = await prisma.eventTicket.findUnique({
      where: { id },
    })
    if (!existing) {
      return new NextResponse('Ticket not found', { status: 404 })
    }

    await prisma.eventTicket.delete({
      where: { id },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        return new NextResponse(
          'Cannot delete ticket with existing payments.',
          {
            status: 409,
          }
        )
      }
    }

    if (error instanceof Error) {
      console.log('[DELETE EVENT TICKET ERROR]: ', error.stack)
    } else {
      console.log('[DELETE EVENT TICKET ERROR]: ', error)
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
