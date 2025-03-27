import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) => {
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

    // Extract the postId from the URL
    const { postId } = await params
    const { isPublished, ...body } = await request.json()
    console.log(isPublished)

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })
    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        ...body,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.log('[Update POST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
