import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) => {
  try {
    // Extract the postId from the URL
    const { postId } = await params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })

    if (!post) {
      return new NextResponse('Post not found', { status: 404 })
    }

    // Delete the post
    const deletedPost = await prisma.post.delete({
      where: {
        id: postId,
      },
    })

    // Revalidate posts cache
    revalidateTag('posts')

    return NextResponse.json(deletedPost)
  } catch (error) {
    console.log('[DELETE POST ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

