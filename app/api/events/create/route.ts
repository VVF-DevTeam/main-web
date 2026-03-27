import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const POST = async (request: Request) => {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes('ADMIN') && !session?.user?.role?.includes('HOST') && !session?.user?.role?.includes('SUPERADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

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

    // Revalidate events cache
    revalidateTag('events')

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
