import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  try {
    const { categoryId } = await params
    const data = await request.json()

    // Check if category exists
    const categoryExists = await prisma.eventCategory.findUnique({
      where: {
        id: categoryId,
      },
    })

    if (!categoryExists) {
      return new NextResponse('Category not found', { status: 404 })
    }

    // Update the category
    const updatedCategory = await prisma.eventCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        ...data,
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.log('[UPDATE_CATEGORY_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

