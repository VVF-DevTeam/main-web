import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
  try {
    // TODO: Check if user is admin
    const data = await request.json()

    // Create new category
    const newCategory = await prisma.eventCategory.create({
      data: {
        ...data,
      },
    })

    return NextResponse.json(newCategory)
  } catch (error) {
    console.log('[CREATE_CATEGORY_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
