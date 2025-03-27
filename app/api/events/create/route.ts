import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
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
