import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) => {
  try {
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
