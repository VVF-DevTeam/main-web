import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const POST = async (request: Request) => {
  try {
    const { title, userId } = await request.json()
    
    // Check if the post with this title already exists
    const existingPost = await prisma.post.findUnique({
      where: {
        title: title,
      },
    })

    if (existingPost) {
      return new NextResponse('Post already exists', { status: 409 })
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title: title,
        userId: userId,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.log('[SIGNIN ERROR]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
