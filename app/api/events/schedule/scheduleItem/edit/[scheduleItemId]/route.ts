import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ scheduleItemId: string }> }
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

    // Check if user is admin
    const { scheduleItemId } = await params
    const data = await request.json()
    // Check if the schedule item exists
    const scheduleItemExists = await prisma.eventSchedule.findUnique({
      where: {
        id: scheduleItemId,
      },
    })

    if (!scheduleItemExists) {
      return new NextResponse(
        'cannot add new item because the current item does not exist',
        { status: 404 }
      )
    }
    console.log(scheduleItemExists)
    // Update the data in the item and save it.
    const updatedItem = await prisma.eventSchedule.update({
      where: {
        id: scheduleItemExists.id,
      },
      data: {
        ...data,
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.log('[UPDATE ERROR]', error)
    return new NextResponse('Internal server Error', { status: 500 })
  }
}
