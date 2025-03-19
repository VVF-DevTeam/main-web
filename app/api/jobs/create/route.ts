import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export const POST = async (req: NextRequest) => {
  try {
    // TODO: Check if user is admin

    // Destructure the request body
    const { title, jobType, keyName, userId } = await req.json()

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
