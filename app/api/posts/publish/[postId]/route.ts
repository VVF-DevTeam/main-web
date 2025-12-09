import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export const PATCH = async (
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) => {
  try {
    // Extract data
    const { postId } = await params

    // Find if post to be unpublished exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })
    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    // Publish the post
    const updatedPost = await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        isPublished: true,
      },
    })

    // Revalidate posts cache
    revalidateTag('posts')

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.log('[PUBLISH POST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
