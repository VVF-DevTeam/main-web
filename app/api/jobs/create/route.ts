import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const POST = async (request: NextRequest) => {
  try {
    // Check for user role, allow ADMIN to create/edit jobs
    const isMobile = request.headers.get('X-App-Client')?.includes('mobile')

    if (!isMobile) {
      // Check role for web app
      const isAdmin = await roleCheck({ role: 'ADMIN' })
      
      if (!isAdmin) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    } else {
      //TODO: Check role for mobile app
    }

    // Destructure the request body
    const { title, jobType, keyName, userId } = await request.json()

    console.log(userId)

    // Create the event
    const event = await prisma.job.create({
      data: {
        title: title,
        jobType: jobType,
        keyName: keyName,
        userId: userId,
      },
    })

    return NextResponse.json(event)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Create Job Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
