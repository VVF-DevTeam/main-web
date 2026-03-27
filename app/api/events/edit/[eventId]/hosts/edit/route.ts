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
    const { hostIds } = await request.json()

    const eventExists = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Add the hosts to the event
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        hosts: {
          connect: hostIds.map((id: string) => ({ id })),
        },
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.log('[EDIT EVENT HOST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Remove host from the database
export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes('ADMIN') && !session?.user?.role?.includes('HOST')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the event exists
    const { eventId } = await params
    const { hostId } = await request.json()

    const eventExists = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // Add the hosts to the event
    const updatedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        hosts: {
          disconnect: {
            id: hostId,
          },
        },
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.log('[EDIT EVENT HOST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
