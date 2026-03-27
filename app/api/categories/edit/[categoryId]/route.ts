import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  try {
    const session = await auth()
    if (!session?.user?.role?.includes('ADMIN') && !session?.user?.role?.includes('SUPERADMIN')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

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

    // Revalidate event categories cache
    revalidateTag('event-categories')

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.log('[UPDATE_CATEGORY_ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

