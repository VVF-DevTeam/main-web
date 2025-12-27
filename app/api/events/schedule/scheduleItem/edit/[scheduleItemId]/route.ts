import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ scheduleItemId: string }> }
) => {
  try {
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
    // Update the data in the item and save it.
    const updatedItem = await prisma.eventSchedule.update({
      where: {
        id: scheduleItemExists.id,
      },
      data: {
        ...data,
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.log('[UPDATE ERROR]', error)
    return new NextResponse('Internal server Error', { status: 500 })
  }
}
