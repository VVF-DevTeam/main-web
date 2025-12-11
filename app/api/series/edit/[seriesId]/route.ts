import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) => {
  try {
    const { seriesId } = await params
    const data = await request.json()

    // Check if series exists
    const seriesExists = await prisma.eventSeries.findUnique({
      where: {
        id: seriesId,
      },
    })

    if (!seriesExists) {
      return new NextResponse('Series not found', { status: 404 })
    }

    // Update the series
    const updatedSeries = await prisma.eventSeries.update({
      where: {
        id: seriesId,
      },
      data: {
        ...data,
      },
    })

    // Revalidate series cache
    revalidateTag('series')

    return NextResponse.json(updatedSeries)
  } catch (error) {
    console.log('[UPDATE_SERIES_ERROR]', error)
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate entry
        return new NextResponse('A series with this name or keyName already exists.', { status: 409 })
      }
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}


