import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const POST = async (request: NextRequest) => {
  try {
    // Extract data from request
    const data = await request.json()

    // Create new series
    const newSeries = await prisma.eventSeries.create({
      data: {
        ...data,
      },
    })

    // Revalidate series cache
    revalidateTag('series')

    return NextResponse.json(newSeries)
  } catch (error) {
    console.log('[CREATE_SERIES_ERROR]', error)
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate entry
        return new NextResponse('A series with this name or keyName already exists.', { status: 409 })
      }
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}


