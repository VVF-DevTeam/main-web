import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const POST = async (request: NextRequest) => {
  try {
    // Check for user role, only allow ADMIN to create category
    const isMobile = request.headers.get('X-App-Client')?.includes('mobile')

    if (!isMobile) {
      // Check role for web app
      const isAdmin = await roleCheck({ role: 'ADMIN' })
      
      if (!isAdmin) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    } else {
      //TODO: For mobile app
    }

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
