import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) => {
  try {
    const { postId } = await params
    const {isPublished, ...body} = await request.json()

    // TODO: Check if user is admin
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
