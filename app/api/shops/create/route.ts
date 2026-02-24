import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ShopType } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const POST = async (request: Request) => {
  try {
    // Destructure the request body
    const { title, slug, ownerId, type } = await request.json()
    const validType =
      typeof type === 'string' && Object.values(ShopType).includes(type as ShopType)
        ? (type as ShopType)
        : ShopType.General

    // Create the shop
    const shop = await prisma.shop.create({
      data: {
        title: title,
        slug: slug,
        ownerId: ownerId,
        type: validType,
      },
    })

    // Revalidate shops cache
    revalidateTag('shops')

    return NextResponse.json(shop)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate entry
        return new NextResponse('A shop with this title or slug already exists.', {
          status: 409,
        })
      }
    }

    if (error instanceof Error) {
      console.log('Create Shop Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

