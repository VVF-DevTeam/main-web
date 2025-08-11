import { prisma } from '../../db'

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

// Find Published Posts by title with pagination
export const getPublishedPostsByTitlePaginated = async (
  title: string,
  page: number = 1,
  postsPerPage: number = 6
) => {
  try {
    const skip = (page - 1) * postsPerPage

    // Get total count for pagination
    const totalCount = await prisma.post.count({
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
        isPublished: true,
      },
    })

    // Get paginated posts
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
      skip,
      take: postsPerPage,
    })

    const totalPages = Math.ceil(totalCount / postsPerPage)

    return {
      posts: publishedPosts,
      totalCount,
      totalPages,
      currentPage: page,
      postsPerPage,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}
