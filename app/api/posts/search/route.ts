import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const searchText = req.nextUrl?.searchParams.get('searchText')
  const pageNum = Number(req?.nextUrl?.searchParams.get('pageNum')) || 0
  const pageSize = Number(req?.nextUrl?.searchParams.get('pageSize')) || 4

  if (!searchText)
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })

  try {
    let totalPost = 0
    let post = null
    const [posts, count] = await Promise.all([
      prisma.post.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          imgUrl: true,
          isPublished: true,
          summary: true,
          _count: {
            select: { postLikes: true, postVisits: true },
          },
        },
        where: {
          content: {
            contains: searchText,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: pageNum * pageSize,
        take: pageSize,
      }),
      prisma.post.count({
        where: {
          isPublished: true,
        },
      }),
    ])
    post = posts
    totalPost = count
    return NextResponse.json(
      { data: post, pageNum, pageSize, total: totalPost },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}
