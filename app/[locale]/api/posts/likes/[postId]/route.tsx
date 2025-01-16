import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) => {
  try {
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
