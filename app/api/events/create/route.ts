import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const POST = async (req: Request) => {
  try {
    // TODO: Check if user is admin

    // Destructure the request body
    const { title, eventType, keyName } = await req.json()

    // Check if an event with ths title and type already exists
    const existingEvent = await prisma.event.findFirst({
      where: {
        title: title,
        eventType: eventType,
      },
    })

    if (existingEvent) {
      return new NextResponse('Event already exists', { status: 409 })
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: title,
        eventType: eventType,
        keyName: keyName,
      },
    })

    return NextResponse.json(event)
    
  } catch (error) {
    console.log('[CREATE EVENT ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
