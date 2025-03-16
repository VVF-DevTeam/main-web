import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const GET = async (
  { params }: { params: Promise<{ postId: string }> }
) => {
  try {
    const postId = (await params)?.postId

    let post = null
    // Check if post exists
    if (!postId) {
      // Get all published and unpublished posts
      post = await prisma.post.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      })
    } else {
      post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      })
      if (!post) {
        return new NextResponse('Post not found', { status: 404 })
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.log('[Update POST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
