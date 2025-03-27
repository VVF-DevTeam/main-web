import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
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
    const { itemId } = await params

    // Check if the schedule item exists
    const scheduleItem = await prisma.eventSchedule.findUnique({
      where: {
        id: itemId,
      },
    })

    if (!scheduleItem) {
      return new NextResponse('Schedule item not found', { status: 404 })
    }

    // Delete the item
    const deletedItem = await prisma.eventSchedule.delete({
      where: {
        id: itemId,
      },
    })

    // Decrement the position of all the items below the deleted item
    await prisma.eventSchedule.updateMany({
      where: {
        position: {
          gt: deletedItem.position,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json(deletedItem)
  } catch (error) {
    console.log('[DELETE ERROR]', error)
    return new NextResponse('Internal server Error', { status: 500 })
  }
}
