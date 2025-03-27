import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) => {
  try {
    const isMobile = request.headers.get('X-App-Client')?.includes('mobile')

    if (!isMobile) {
      // Check login status, only logged in user can like
      const session = await auth()
      if (!session?.user) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    } else {
      //TODO: Check role for mobile app
    }

    const { postId } = await params
    const { userId, action } = await request.json()
    // Find if post to be unpublished exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })
    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    // Update likes of the post
    let updatedLikes
    if (action === 'like') {
      console.log('liking a post')
      updatedLikes = await prisma.postLikes.create({
        data: {
          postId: post.id,
          userId: userId,
        },
      })
    } else {
      console.log('disliking a post')
      updatedLikes = await prisma.postLikes.delete({
        where: {
          postId_userId: { postId: post.id, userId: userId },
        },
      })
    }
    return NextResponse.json(updatedLikes)
  } catch (error) {
    console.log('[PUBLISH POST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
