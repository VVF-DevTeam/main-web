import { prisma } from '../../db'
import { Post, PostLikes, PostVisits } from '@prisma/client'
import { unstable_cache } from 'next/cache'

// Base post data
type PostBase = Pick<Post, 'id' | 'title' | 'summary' | 'imgUrl' | 'createdAt'>

// Post counts
type PostCounts = {
  _count: { 
    postLikes: number
    postVisits: number 
  }
}

// Post relations
type PostRelations = {
  postLikes: PostLikes[]
  postVisits: PostVisits[]
}

// Combined cached post item
export type CachedPostItem = PostBase & PostCounts & PostRelations

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

// Find Published Posts by title with pagination (original - kept for backward compatibility)
export const getPublishedPostsByTitlePaginated = async (
  title: string,
  page: number = 1,
  postsPerPage: number = 6
) => {
  try {
    const skip = (page - 1) * postsPerPage

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
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
      }),
      prisma.post.count({
        where: {
          title: {
            contains: title,
            mode: 'insensitive',
          },
          isPublished: true,
        },
      }),
    ])

    const totalPages = Math.ceil(totalCount / postsPerPage)

    return {
      posts: posts as CachedPostItem[],
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

// Cached version for ISR (use this in Server Components)
export const getCachedPostsPaginated = unstable_cache(
  async (title: string, page: number = 1, postsPerPage: number = 6) => {
    try {
      const skip = (page - 1) * postsPerPage

      const [posts, totalCount] = await Promise.all([
        prisma.post.findMany({
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
        }),
        prisma.post.count({
          where: {
            title: {
              contains: title,
              mode: 'insensitive',
            },
            isPublished: true,
          },
        }),
      ])

      const totalPages = Math.ceil(totalCount / postsPerPage)

      return {
        posts: posts as CachedPostItem[],
        totalCount,
        totalPages,
        currentPage: page,
        postsPerPage,
      }
    } catch (error) {
      console.log(error)
      return null
    }
  },
  ['posts-paginated'], // Cache key
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['posts'],
  }
)

// Get all posts (both published and unpublished) for admin management
export const getAllPosts = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    try {
      const posts = await prisma.post.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      })
      return posts
    } catch (error) {
      console.error('Error getting all posts:', error)
      return []
    }
  },
  ['posts-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['posts'], // Tag for revalidation
  }
)

// Get post by id specifically for editing
export const getPostForEditing = unstable_cache(
  async (postId: string) => {
    const { prisma } = await import('@/lib/db')
    try {
      return await prisma.post.findUnique({
        where: {
          id: postId,
        },
      })
    } catch (error) {
      console.error('Error getting post for editing:', error)
      return null
    }
  },
  ['post-for-editing'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour (shorter since this is for editing)
    tags: ['posts'], // Tag for revalidation
  }
)

// Get post by id for public post detail page
export const getPostById = unstable_cache(
  async (postId: string) => {
    try {
      return await prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      })
    } catch (error) {
      console.error('Error getting post by id:', error)
      return null
    }
  },
  ['post-by-id'],
  {
    revalidate: 604800,
    tags: ['posts'],
  }
)

// Type inference: Extract the return type of getPostForEditing and unwrap Promise and null
export type PostForEditing = NonNullable<
  Awaited<ReturnType<typeof getPostForEditing>>
>
