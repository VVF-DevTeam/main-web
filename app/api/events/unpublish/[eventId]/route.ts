import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'
export const PATCH = async (
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
    const { eventId } = await params
    const eventExists = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    const unpublishedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        isPublished: false,
      },
    })
    return NextResponse.json(unpublishedEvent)
  } catch (error) {
    console.log('[UNPUBLISH ERROR]', error)
    return new NextResponse('internal error', { status: 500 })
  }
}
