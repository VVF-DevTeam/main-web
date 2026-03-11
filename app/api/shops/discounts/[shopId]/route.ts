import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) => {
  try {
    const { shopId } = await params
    const body = await request.json()
    const { discounts } = body as { discounts: unknown }

    const shopExists = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true },
    })

    if (!shopExists) {
      return new NextResponse('Shop not found', { status: 404 })
    }

    const isEmptyDiscounts =
      !discounts || (Array.isArray(discounts) && discounts.length === 0)

    let shopDiscountsData: Prisma.JsonValue | typeof Prisma.JsonNull =
      Prisma.JsonNull
    let shopCodeDiscountsData: Prisma.JsonValue | typeof Prisma.JsonNull =
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

      shopDiscountsData =
        nonCodeDiscounts.length > 0
          ? (nonCodeDiscounts as Prisma.JsonValue)
          : Prisma.JsonNull
      shopCodeDiscountsData =
        codeDiscounts.length > 0
          ? (codeDiscounts as Prisma.JsonValue)
          : Prisma.JsonNull
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        shopDiscounts: isEmptyDiscounts
          ? (Prisma.JsonNull as Prisma.JsonNullValueInput)
          : (shopDiscountsData as Prisma.InputJsonValue),
        shopCodeDiscounts: isEmptyDiscounts
          ? (Prisma.JsonNull as Prisma.JsonNullValueInput)
          : (shopCodeDiscountsData as Prisma.InputJsonValue),
      },
    })

    revalidateTag('shops')

    return NextResponse.json(updatedShop, { status: 200 })
  } catch (error) {
    console.log('[UPSERT SHOP DISCOUNTS ERROR]', error)
    if (error instanceof PrismaClientKnownRequestError) {
      return new NextResponse('Database error while saving shop discounts.', {
        status: 500,
      })
    }

    return new NextResponse('Internal server error', { status: 500 })
  }
}


