import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    // Check for user role, allow ADMIN and HOST to create/edit events
    const isMobile = request.headers.get('X-App-Client')?.includes('mobile')

    if (!isMobile) {
      // Check role for web app
      const isAdmin = await roleCheck({ role: 'ADMIN' })
      const isHost = await roleCheck({ role: 'HOST' })
      
      if (!isAdmin && !isHost) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    } else {
      //TODO: Check role for mobile app
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
    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.log('[EDIT EVENT HOST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// REmoce host from the database

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
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
    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.log('[EDIT EVENT HOST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
