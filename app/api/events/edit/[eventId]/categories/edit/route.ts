import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    // Check for user role, allow ADMIN and HOST to create/edit events
    const isMobile = request.headers.get('X-App-Client')?.includes('mobile')

    if (!isMobile) {
      // Check role for web app
      const isAdmin = await roleCheck({ role: 'ADMIN' })
      const isHost = await roleCheck({ role: 'HOST' })
      
      if (!isAdmin && !isHost) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    } else {
      //TODO: Check role for mobile app
    }

    const { eventId } = await params
    const categories = await request.json()
    const updatedCategories = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        categories: {
          connect: [
            ...categories.map((category: { id: string }) => ({
              id: category.id,
            })),
          ],
        },
      },
    })

    return NextResponse.json(updatedCategories)
  } catch (error) {
    console.log('[EDIT CATEGORY ERROR]', error)
    return new NextResponse('internal error', { status: 500 })
  }
}

// Deleting a category from an event
export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) => {
  try {
    // Check if user is admin
    const { eventId } = await params
    const { categoryId } = await request.json()
    console.log(categoryId)
    // delete the category from the eventID
    const updatedCategories = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        categories: {
          disconnect: {
            id: categoryId,
          },
        },
      },
    })

    return NextResponse.json(updatedCategories)
  } catch (error) {
    console.log('[EDIT CATEGORY ERROR]', error)
    return new NextResponse('internal error', { status: 500 })
  }
}
