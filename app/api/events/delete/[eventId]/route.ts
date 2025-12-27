import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    // Extract the eventId from the URL
    const { eventId } = await params

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Delete the event
    const deletedEvent = await prisma.event.delete({
      where: {
        id: eventId,
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(deletedEvent)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        return new NextResponse('There are existing payment records for this event.', { status: 400 })
      }
    }  
    console.log('[DELETE EVENT ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
