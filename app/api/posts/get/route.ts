import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export const GET = async (
  request: NextRequest,
) => {
  try {
    const postId = request?.nextUrl?.searchParams.get('postId')
    
    console.log(postId)
    
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
