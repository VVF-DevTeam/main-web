import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
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
    return NextResponse.json(publishedEvent)
  } catch (error) {
    console.log('[PUBLISH ERROR]', error)
    return new NextResponse('internal error', { status: 500 })
  }
}
