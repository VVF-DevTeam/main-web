import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const POST = async (request: Request) => {
  try {
    // Destructure the request body
    const { title, eventType, keyName } = await request.json()

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
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate entry
        return new NextResponse('You have already applied for this job.', {
          status: 409,
        })
      }
    }

    if (error instanceof Error) {
      console.log('Edit Job Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
