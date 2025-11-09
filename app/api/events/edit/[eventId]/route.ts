import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    // Extract the data from the request
    const { isPublished, ...values } = await request.json()
    const { eventId } = await params
    
    console.log(isPublished)
    // Check if the event exists
    const eventExists = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // TODO: Do we need to assign to eventExists.days?
    const eventDays = (eventExists.days = values.days)

    // Update the event
    let updatedEvent
    if (values.days) {
      updatedEvent = await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          days: eventDays,
        },
      })
    } else {
      updatedEvent = await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          ...values,
        },
      })
    }

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.log('[EDIT EVENT ERROR]', error)
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate entry
        return new NextResponse('There is already an event with the same title or keyName.', { status: 409 })
      }
    }     
    return new NextResponse('Internal server error', { status: 500 })
  }
}
