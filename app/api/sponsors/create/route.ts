import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const POST = async (request: Request) => {
  try {
    const values = await request.json()

    const created = await prisma.eventSponsor.create({
      data: {
        name: values.name,
        imgUrl: values.imgUrl,
        description: values.description,
        displayName: values.displayName,
        event: {
          connect: values.eventIds.map((id: string) => ({ id })),
        },
      },
    })

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




