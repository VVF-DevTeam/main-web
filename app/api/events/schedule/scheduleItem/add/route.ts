import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const POST = async (request: Request) => {
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
    const { scheduleItemId, ...data } = await request.json()
    // Check if the schedule item is null, if yes, then create a new item and return
    if (scheduleItemId === null) {
      const newItem = await prisma.eventSchedule.create({
        data: {
          position: 1,
          ...data,
        },
      })
      return NextResponse.json(newItem)
    }
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

    // Shift the position of all items by one
    await prisma.eventSchedule.updateMany({
      where: {
        position: {
          gt: scheduleItemExists.position,
        },
      },
      data: {
        position: {
          increment: 1,
        },
      },
    })
    const newItem = await prisma.eventSchedule.create({
      data: {
        eventId: scheduleItemExists.eventId,
        position: scheduleItemExists.position + 1,
      },
    })
    return NextResponse.json(newItem)
  } catch (error) {
    console.log('[DELETE ERROR]', error)
    return new NextResponse('Internal server Error', { status: 500 })
  }
}
