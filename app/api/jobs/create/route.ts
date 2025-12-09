import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const POST = async (request: NextRequest) => {
  try {
    // Destructure the request body
    const { title, jobType, keyName, userId } = await request.json()

    // Create the job
    const job = await prisma.job.create({
      data: {
        title: title,
        jobType: jobType,
        keyName: keyName,
        userId: userId,
      },
    })

    // Revalidate the jobs page to show the new job immediately
    revalidatePath('/registration/jobs', 'page')

    return NextResponse.json(job)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Create Job Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
