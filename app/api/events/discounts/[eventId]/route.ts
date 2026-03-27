import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

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
    const { discounts } = body as { discounts: unknown }

    // Ensure the event exists
    const eventExists = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    })

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 })
    }

    // If discounts is null or empty array, clear the discounts
    const isEmptyDiscounts =
      !discounts ||
      (Array.isArray(discounts) && discounts.length === 0)

    // Prepare separated discounts:
    // - eventDiscounts: all discounts EXCEPT "Code Discount"
    // - eventCodeDiscounts: ONLY "Code Discount"
    let eventDiscountsData: Prisma.JsonValue | typeof Prisma.JsonNull =
      Prisma.JsonNull
    let eventCodeDiscountsData: Prisma.JsonValue | typeof Prisma.JsonNull =
      Prisma.JsonNull

    if (!isEmptyDiscounts && Array.isArray(discounts)) {
      const allDiscounts = discounts as Array<{
        type?: string
        [key: string]: unknown
      }>

      const codeDiscounts = allDiscounts.filter(
        (d) => d?.type === 'Code Discount'
      )
      const nonCodeDiscounts = allDiscounts.filter(
        (d) => d?.type !== 'Code Discount'
      )

      eventDiscountsData =
        nonCodeDiscounts.length > 0 ? (nonCodeDiscounts as Prisma.JsonValue) : Prisma.JsonNull
      eventCodeDiscountsData =
        codeDiscounts.length > 0 ? (codeDiscounts as Prisma.JsonValue) : Prisma.JsonNull
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        eventDiscounts: isEmptyDiscounts
          ? (Prisma.JsonNull as Prisma.JsonNullValueInput)
          : (eventDiscountsData as Prisma.InputJsonValue),
        eventCodeDiscounts: isEmptyDiscounts
          ? (Prisma.JsonNull as Prisma.JsonNullValueInput)
          : (eventCodeDiscountsData as Prisma.InputJsonValue),
      },
    })

    // Revalidate any caches that depend on events
    revalidateTag('events')

    return NextResponse.json(updatedEvent, { status: 200 })
  } catch (error) {
    console.log('[UPSERT EVENT DISCOUNTS ERROR]', error)
    if (error instanceof PrismaClientKnownRequestError) {
      return new NextResponse('Database error while saving event discounts.', {
        status: 500,
      })
    }

    return new NextResponse('Internal server error', { status: 500 })
  }
}


