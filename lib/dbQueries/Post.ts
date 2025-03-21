import { prisma } from '../db'

// Find Published Posts by title
export const getPublishedPostsByTitle = async (title: string) => {
  try {
    const publishedPosts = await prisma.post.findMany({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        imgUrl: true,
        createdAt: true,
        postLikes: true,
        postVisits: true,
        _count: {
          select: {
            postLikes: true,
            postVisits: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return publishedPosts
  } catch (error) {
    console.log(error)
    return null
  }
}
