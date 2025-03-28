import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendApplication } from '@/lib/actions/email/sendApplication'
import { JobType } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  try {
    // Extract data
    const formData = await request.formData()
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

    // Extract and convert resume file
    const resumeFile = formData.get('resume') as File
    const resumeArrayBuffer = await resumeFile.arrayBuffer()
    const resumeBuffer = Buffer.from(resumeArrayBuffer)

    const jobData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      postCode: formData.get('postCode') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phoneNumber') as string,
    }

    // Apply for the job
    const appliedJob = await prisma.application.create({
      data: {
        ...jobData,
        jobId: jobId,
        userId: formData.get('userId') as string,
        resume: resumeBuffer,
      },
    })

    // Send Application Email
    await sendApplication({
      ...jobData,
      keyName: formData.get('keyName') as string,
      jobType: formData.get('jobType') as JobType,
      resume: resumeFile,
    })

    return NextResponse.json(appliedJob)
  } catch (error: unknown) {
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
