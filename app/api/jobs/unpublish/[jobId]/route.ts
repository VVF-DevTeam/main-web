import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  try {
    const { jobId } = await params
    const jobExists = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    })

    if (!jobExists) {
      return new NextResponse('Job not found', { status: 404 })
    }

    const unpublishedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        isPublished: false,
      },
    })
    return NextResponse.json(unpublishedJob)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Publish Job Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
