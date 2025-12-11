import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    // extract the id from the params
    const { eventId } = await params
    const eventExists = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    const publishedEvent = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        isPublished: true,
      },
    })

    // Revalidate events cache
    revalidateTag('events')

    return NextResponse.json(publishedEvent)
  } catch (error) {
    console.log('[PUBLISH ERROR]', error)
    return new NextResponse('internal error', { status: 500 })
  }
}
