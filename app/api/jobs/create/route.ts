import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export const POST = async (request: NextRequest) => {
  try {
    // Destructure the request body
    const { title, jobType, keyName, userId } = await request.json()

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
