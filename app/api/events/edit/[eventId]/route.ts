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
    return new NextResponse('Internal server error', { status: 500 })
  }
}
