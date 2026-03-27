import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes('ADMIN') && !session?.user?.role?.includes('HOST') && !session?.user?.role?.includes('SUPERADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the event exists
    const { eventId } = await params
    const { seriesId } = await request.json()

    const eventExists = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Update the event with the series
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        seriesId: seriesId || null,
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.log('[EDIT EVENT SERIES ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Remove series from the event
export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes('ADMIN') && !session?.user?.role?.includes('HOST')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { eventId } = await params

    const eventExists = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Remove the series from the event
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        seriesId: null,
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.log('[DELETE EVENT SERIES ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

