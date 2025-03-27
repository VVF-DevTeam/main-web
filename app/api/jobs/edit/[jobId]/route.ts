import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) => {
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
