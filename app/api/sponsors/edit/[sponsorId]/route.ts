import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { SponsorTier } from '@prisma/client'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ sponsorId: string }> }
) => {
  try {
    const values = await request.json()
    const { sponsorId } = await params

    const existingSponsor = await prisma.eventSponsor.findUnique({
      where: { id: sponsorId },
      include: { events: true },
    })

    if (!existingSponsor) {
      return new NextResponse('Sponsor not found', { status: 404 })
    }

    // Delete all existing SponsorOnEvent relations and create new ones
    const updated = await prisma.eventSponsor.update({
      where: { id: sponsorId },
      data: {
        name: values.name,
        imgUrl: values.imgUrl,
        description: values.description,
        displayName: values.displayName,
        url: values.url,
        events: {
          deleteMany: {},
          create: values.events.map((event: { eventId: string; tier: SponsorTier; order: number }) => ({
            eventId: event.eventId,
            tier: event.tier,
            order: event.order,
          })),
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.log('[EDIT_SPONSOR_ERROR]', error)

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new NextResponse('There is already a sponsor with the same name.', {
          status: 409,
        })
      }
    }

    return new NextResponse('Internal server error', { status: 500 })
  }
}




