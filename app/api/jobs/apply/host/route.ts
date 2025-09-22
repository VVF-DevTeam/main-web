import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendApplication } from '@/lib/actions/email/sendApplication'
import { JobType } from '@prisma/client'

export const POST = async (request: Request) => {
  try {
    // Extract data from request body
    const body = await request.json()
    const {
      firstName,
      lastName,
      address,
      city,
      country,
      postalCode,
      email,
      phone,
      teachHost,
      experience,
      availability,
      userId
    } = body

    const existing = await prisma.application.findFirst({
      where: {
        userId,
        positionToApply: { equals: teachHost, mode: "insensitive" },
      },
      select: { id: true },
    });
  
    if (existing) {
      return NextResponse.json(
        { error: `You have already submitted a host application for ${teachHost}.`, id: existing.id },
        { status: 409 }
      );
    }
    // Store host application in database
    const hostApplication = await prisma.application.create({
      data: {
        firstName,
        lastName,
        address,
        city,
        country,
        postCode: postalCode,
        email,
        phoneNumber: phone,
        userId,
        reasonToApply: experience,
        positionToApply: teachHost,
        resume: Buffer.from('Host Application'), // Dummy resume for host applications
      },
    })

    // Send email to HR
    await sendApplication({
      firstName,
      lastName,
      address,
      city,
      country,
      postCode: postalCode,
      email,
      phoneNumber: phone,
      keyName: 'host-event',
      jobType: JobType.HR, // Use HR job type for host applications
      teachHost,
      experience,
      availability: availability,
    })

    return NextResponse.json({ 
      success: true, 
      applicationId: hostApplication.id,
      message: 'Host application submitted successfully' 
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log('Host Application Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

