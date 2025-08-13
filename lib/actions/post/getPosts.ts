import { prisma } from '../../db'
import { Post, PostLikes, PostVisits } from '@prisma/client'

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
type CachedPostItem = PostBase & PostCounts & PostRelations

type PostsCacheEntry = {
  data: CachedPostItem[]
  totalCount: number
  timestamp: number
  fetchLimit?: number
}

const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes
const postsCacheByTitle: Map<string, PostsCacheEntry> = new Map()

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
    const normalizedTitle = (title || '').toLowerCase().trim()
    const cacheKey = `title:${normalizedTitle}`
    const now = Date.now()

    const requiredPosts = page * postsPerPage
    const smartFetchLimit = Math.max(requiredPosts * 2, 30)

    const cached = postsCacheByTitle.get(cacheKey)
    const isCacheValid = !!cached && now - cached.timestamp < CACHE_DURATION_MS
    let hasEnoughCachedPosts = false

    if (isCacheValid && cached) {
      const cachedCount = cached.data.length
      const previousFetchLimit = cached.fetchLimit || 30
      const previouslyReachedEnd = cachedCount < previousFetchLimit * 0.8
      hasEnoughCachedPosts = cachedCount >= requiredPosts || previouslyReachedEnd
    }

    let allPosts: CachedPostItem[]
    let totalCount: number

    if (isCacheValid && cached && hasEnoughCachedPosts) {
      allPosts = cached.data
      totalCount = cached.totalCount
    } else {
      // Always get accurate totalCount from DB (cheap and ensures correct pagination)
      totalCount = await prisma.post.count({
        where: {
          title: {
            contains: title,
            mode: 'insensitive',
          },
          isPublished: true,
        },
      })

      // Fetch the first N posts based on smart limit (ordered by updatedAt desc)
      const fetched = await prisma.post.findMany({
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
        take: smartFetchLimit,
      })

      allPosts = fetched as CachedPostItem[]

      postsCacheByTitle.set(cacheKey, {
        data: allPosts,
        totalCount,
        timestamp: now,
        fetchLimit: smartFetchLimit,
      })
    }

    const startIndex = (page - 1) * postsPerPage
    const endIndex = startIndex + postsPerPage
    const paginatedPosts = allPosts.slice(startIndex, endIndex)

    const totalPages = Math.ceil(totalCount / postsPerPage)

    return {
      posts: paginatedPosts,
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
