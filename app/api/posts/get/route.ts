import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export const GET = async (request: NextRequest) => {
  try {
    const userId = request.headers.get('userId') || undefined
    const postId = request?.nextUrl?.searchParams.get('postId')
    const searchText =
      request?.nextUrl?.searchParams.get('searchText') || undefined
    const pageNum = Number(request?.nextUrl?.searchParams.get('pageNum')) || 0
    const pageSize = Number(request?.nextUrl?.searchParams.get('pageSize')) || 2

    const isPublishedParam = request?.nextUrl.searchParams.get('isPublished')
    const isPublished =
      isPublishedParam === 'true'
        ? true
        : isPublishedParam === 'false'
          ? false
          : undefined

    let totalPost = 0
    let post = null

    if (!postId) {
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
            ...(userId && {
              postLikes: {
                select: {
                  id: true,
                },
                where: {
                  userId: userId,
                },
              },
            }),
            _count: {
              select: { postLikes: true, postVisits: true },
            },
          },
          where: {
            content: {
              contains: searchText,
              mode: 'insensitive',
            },
            ...(isPublished !== undefined && {
              isPublished: isPublished,
            }),
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip: pageNum * pageSize,
          take: pageSize,
        }),
        prisma.post.count({
          where: {
            content: {
              contains: searchText,
              mode: 'insensitive',
            },
            ...(isPublished !== undefined && {
              isPublished: isPublished,
            }),
          },
        }),
      ])
      post = posts.map((item) => ({
        ...item,
        ...(userId && {
          liked: (item?.postLikes && item?.postLikes?.length > 0) || null,
        }),
      }))
      totalPost = count
    } else {
      const result = await prisma.post.findUnique({
        select: {
          id: true,
          title: true,
          content: true,
          updatedAt: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
          postLikes: {
            select: {
              id: true,
            },
            where: {
              userId: userId,
            },
          },
        },
        where: {
          id: postId,
        },
      })
      post = {
        id: result?.id,
        title: result?.title,
        content: result?.content,
        updateAt: result?.updatedAt,
        createAt: result?.createdAt,
        authorName: result?.user.name,
        ...(userId && {
          liked: (result?.postLikes && result?.postLikes?.length > 0) || null,
        }),
      }
      if (!post) {
        return NextResponse.json({ message: 'Post not found' }, { status: 404 })
      }
    }

    return NextResponse.json(
      { data: post, pageNum, pageSize, total: totalPost },
      { status: 200 }
    )
  } catch (error) {
    console.log('[Update POST ERROR]', error)
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}
