import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    const { eventId } = await params

    const eventForm = await prisma.eventForm.findFirst({
      where: { eventId },
    })

    return NextResponse.json(
      {
        data: eventForm?.FormData ?? null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.log('[GET EVENT FORM ERROR]', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes('ADMIN') && !session?.user?.role?.includes('HOST') && !session?.user?.role?.includes('SUPERADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { eventId } = await params
    const body = await request.json()
    const { formData } = body as { formData: unknown }

    // Ensure the event exists
    const eventExists = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    const existingForm = await prisma.eventForm.findFirst({
      where: { eventId },
    })

    // If formData is null or has no questions, remove the EventForm entry
    const isEmptyForm =
      !formData ||
      (typeof formData === 'object' &&
        formData !== null &&
        Array.isArray((formData as any).questions) &&
        (formData as any).questions.length === 0)

    let savedForm

    if (isEmptyForm) {
      if (existingForm) {
        await prisma.eventForm.delete({
          where: { id: existingForm.id },
        })
      }
      revalidateTag('events')
      return NextResponse.json(
        { message: 'Event form cleared successfully.' },
        { status: 200 }
      )
    }

    if (existingForm) {
      savedForm = await prisma.eventForm.update({
        where: { id: existingForm.id },
        data: {
          FormData: formData,
        },
      })
    } else {
      savedForm = await prisma.eventForm.create({
        data: {
          eventId,
          FormData: formData,
        },
      })
    }

    // Revalidate any caches that depend on events
    revalidateTag('events')

    return NextResponse.json(savedForm, { status: 200 })
  } catch (error) {
    console.log('[UPSERT EVENT FORM ERROR]', error)
    if (error instanceof PrismaClientKnownRequestError) {
      return new NextResponse('Database error while saving event form.', {
        status: 500,
      })
    }

    return new NextResponse('Internal server error', { status: 500 })
  }
}


