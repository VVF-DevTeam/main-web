import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidatePath, revalidateTag } from 'next/cache'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  try {
    // Extract data
    const { isPublished, ...values } = await request.json()
    const { jobId } = await params

    console.log(isPublished)
    
    // Check if the job exists
    const jobExists = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    })

    if (!jobExists) {
      return new NextResponse('Job not found', { status: 404 })
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        ...values,
      },
    })

    // Revalidate the jobs page to reflect the changes
    revalidatePath('/registration/jobs', 'page')
    revalidateTag('jobs')

    return NextResponse.json(updatedJob)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Edit Job Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
