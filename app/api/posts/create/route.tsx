import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

export const POST = async (request: Request) => {
  try {
    // Extract the title and userId from the request body
    const { title, userId } = await request.json()

    // Create the post
    const post = await prisma.post.create({
      data: {
        title: title,
        userId: userId,
      },
    })

    // Revalidate posts cache
    revalidateTag('posts')

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
