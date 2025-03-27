import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const POST = async (request: Request) => {
  try {
    // Check for user role, allow ADMIN to create/edit posts
    const isMobile = request.headers.get('X-App-Client')?.includes('mobile')

    if (!isMobile) {
      // Check role for web app
      const isAdmin = await roleCheck({ role: 'ADMIN' })

      if (!isAdmin) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    } else {
      //TODO: Check role for mobile app
    }

    // Extract the title and userId from the request body
    const { title, userId } = await request.json()

    // Create the post
    const post = await prisma.post.create({
      data: {
        title: title,
        userId: userId,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Duplicate entry
        return new NextResponse('There is already a post with this title.', { status: 409 })
      }
    }        
    if (error instanceof Error) {
      console.log('Edit Job Error: ', error.stack)
    } else {
      console.log('Error: ', error)
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
