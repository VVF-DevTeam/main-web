import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ShopType } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) => {
  try {
    // Extract the data from the request
    const { isPublished, ...values } = await request.json()
    const { shopId } = await params

    // Validate the shop type
    if (
      values.type &&
      (!(
        typeof values.type === 'string' &&
        Object.values(ShopType).includes(values.type as ShopType)
      ))
    ) {
      return new NextResponse('Invalid shop type', { status: 400 })
    }

    // Check if the shop exists
    const shopExists = await prisma.shop.findUnique({
      where: {
        id: shopId,
      },
    })

    if (!shopExists) {
      return new NextResponse('Shop not found', { status: 404 })
    }

    // Update the shop with the provided values
    const updatedShop = await prisma.shop.update({
      where: {
        id: shopId,
      },
      data: {
        ...values,
      },
    })

    // Revalidate shops cache
    revalidateTag('shops')

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.log('[EDIT SHOP ERROR]', error)
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate entry
        return new NextResponse(
          'There is already a shop with the same title or slug.',
          { status: 409 }
        )
      }
    }
    return new NextResponse('Internal server error', { status: 500 })
  }
}
