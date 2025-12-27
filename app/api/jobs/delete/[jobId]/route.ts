import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidatePath } from 'next/cache'

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  try {
    // Extract the jobId from the URL
    const { jobId } = await params

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    })

    if (!job) {
      return new NextResponse('Job not found', { status: 404 })
    }

    // Delete the job
    const deletedJob = await prisma.job.delete({
      where: {
        id: jobId,
      },
    })

    // Revalidate the jobs page to reflect the changes
    revalidatePath('/registration/jobs', 'page')

    return NextResponse.json(deletedJob)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        return new NextResponse('There are existing applications for this job.', { status: 400 })
      }
    }  
    console.log('[DELETE JOB ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}



