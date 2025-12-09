import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  try { 
    // Extract the jobId from the URL
    const { jobId } = await params

    // Check if the job exists
    const jobExists = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    })

    if (!jobExists) {
      return new NextResponse('Job not found', { status: 404 })
    }

    const publishedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        isPublished: true,
      },
    })

    // Revalidate the jobs page to show the newly published job
    revalidatePath('/registration/jobs', 'page')

    return NextResponse.json(publishedJob)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Publish Job Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
