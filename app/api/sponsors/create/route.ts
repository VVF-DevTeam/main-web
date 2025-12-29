import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { SponsorTier } from '@prisma/client'
import { revalidateTag } from 'next/cache'

export const POST = async (request: Request) => {
  try {
    const values = await request.json()

    const created = await prisma.eventSponsor.create({
      data: {
        name: values.name,
        imgUrl: values.imgUrl,
        description: values.description,
        displayName: values.displayName,
        url: values.url,
        events: {
          create: values.events.map((event: { eventId: string; tier: SponsorTier; order: number }) => ({
            eventId: event.eventId,
            tier: event.tier,
            order: event.order,
          })),
        },
      },
    })

    // Revalidate event sponsors cache
    revalidateTag('event-sponsors')

    return NextResponse.json(created)
  } catch (error) {
    console.log('[CREATE_SPONSOR_ERROR]', error)

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




