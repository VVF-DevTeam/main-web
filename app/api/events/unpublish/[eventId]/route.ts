import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    // extract id from params
    const { eventId } = await params

    // check if event exists
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

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(unpublishedEvent)
  } catch (error) {
    console.log('[UNPUBLISH ERROR]', error)
    return new NextResponse('internal error', { status: 500 })
  }
}
