import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    // Extract data from request
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
