import { SocialMediaPost } from '@/lib/types/socialMediaPostsType'
import { unstable_cache } from 'next/cache'

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID as string
const INSTAGRAM_ID = process.env.INSTAGRAM_ID as string
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN as string

type FacebookPostResponse = {
  id: string
  message?: string
  full_picture?: string
  permalink_url: string
  created_time: string
  likes?: {
    summary: {
      total_count: number
    }
  }
  comments?: {
    summary: {
      total_count: number
    }
  }
}

type InstagramMediaResponse = {
  id: string
  caption?: string
  media_url: string
  media_type: string
  permalink: string
  timestamp: string
  thumbnail_url?: string
  like_count: number
  comments_count: number
}

const localeMap: Record<'en' | 'vi' | 'fr', string> = {
  en: 'en-US',
  vi: 'vi-VN',
  fr: 'fr-FR',
}

const formatDate = (rawDate: string, locale: 'en' | 'vi' | 'fr') =>
  new Intl.DateTimeFormat(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(rawDate))

export const getSocialMediaPosts = async (
  locale: 'en' | 'vi' | 'fr' = 'en',
  numposts: number
): Promise<SocialMediaPost[]> => {
  try {
    // 1. Fetch Facebook Posts
    const fbRes = await fetch(
      `https://graph.facebook.com/v22.0/${FACEBOOK_PAGE_ID}/posts?fields=id,message,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true)&limit=${numposts}&access_token=${FACEBOOK_ACCESS_TOKEN}`
    )
    const fbJson = await fbRes.json()

    const facebookPosts: SocialMediaPost[] = (fbJson.data || []).map(
      (post: FacebookPostResponse, index: number) => ({
        id: index,
        username: 'vietvibe',
        content: post.message || '',
        image: post.full_picture || '',
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        url: post.permalink_url,
        timestamp: post.created_time,
        platform: 'facebook',
      })
    )

    // 2. Fetch Instagram Posts
    const igRes = await fetch(
      `https://graph.facebook.com/v22.0/${INSTAGRAM_ID}/media?fields=id,caption,media_url,media_type,permalink,timestamp,thumbnail_url,like_count,comments_count&limit=${numposts}&access_token=${FACEBOOK_ACCESS_TOKEN}`
    )
    const igJson = await igRes.json()

    const instagramPosts: SocialMediaPost[] = (igJson.data || []).map(
      (post: InstagramMediaResponse, index: number) => ({
        id: facebookPosts.length + index,
        username: 'vietvibe',
        content: post.caption || '',
        image:
          post.media_type === 'VIDEO'
            ? post.thumbnail_url || post.media_url
            : post.media_url,
        likes: post.like_count,
        comments: post.comments_count,
        url: post.permalink,
        timestamp: post.timestamp,
        platform: 'instagram',
      })
    )

    // 3. Combine, filter, sort, and return top 8
    return [...facebookPosts, ...instagramPosts]
      .filter((post) => post.content.trim() !== '')
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, numposts)
      .map((post) => ({
        ...post,
        timestamp: formatDate(post.timestamp, locale),
      }))
  } catch (error) {
    console.error('Error fetching social media posts:', error.message)
    return []
  }
}

// Original function (kept for backward compatibility if needed)
export const getSocialMediaPostsPaginated = async (
  locale: 'en' | 'vi' | 'fr' = 'en',
  currentPage: number = 1,
  postsPerPage: number = 6,
  content: string = ''
): Promise<{
  posts: SocialMediaPost[]
  totalCount: number
  totalPages: number
  currentPage: number
  fetchedCount: number
  isEstimated: boolean
  hasMorePages: boolean
}> => {
  try {
    // Fetch a reasonable amount of posts (enough for pagination)
    // Limit for facebook API is 100
    const fetchLimit = 100

    // Fetch posts from both platforms in parallel
    const [fbRes, igRes] = await Promise.all([
      fetch(
        `https://graph.facebook.com/v22.0/${FACEBOOK_PAGE_ID}/posts?fields=id,message,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true)&limit=${fetchLimit}&access_token=${FACEBOOK_ACCESS_TOKEN}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      ),
      fetch(
        `https://graph.facebook.com/v22.0/${INSTAGRAM_ID}/media?fields=id,caption,media_url,media_type,permalink,timestamp,thumbnail_url,like_count,comments_count&limit=${fetchLimit}&access_token=${FACEBOOK_ACCESS_TOKEN}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      ),
    ])

    const [fbJson, igJson] = await Promise.all([fbRes.json(), igRes.json()])
    // Process Facebook posts
    const facebookPosts: SocialMediaPost[] = (fbJson.data || [])
      .filter(
        (post: FacebookPostResponse) =>
          post.message?.trim() !== '' &&
          post.message !== null &&
          post.message !== undefined
      )
      .map((post: FacebookPostResponse) => ({
        id: `fb_${post.id}`,
        username: 'vietvibe',
        content: post.message || '',
        image: post.full_picture || '',
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        url: post.permalink_url,
        timestamp: post.created_time,
        platform: 'facebook',
      }))

    // Process Instagram posts
    const instagramPosts: SocialMediaPost[] = (igJson.data || [])
      .filter(
        (post: InstagramMediaResponse) =>
          post.caption?.trim() !== '' &&
          post.caption !== null &&
          post.caption !== undefined
      )
      .map((post: InstagramMediaResponse) => ({
        id: `ig_${post.id}`,
        username: 'vietvibe',
        content: post.caption || '',
        image:
          post.media_type === 'VIDEO'
            ? post.thumbnail_url || post.media_url
            : post.media_url,
        likes: post.like_count,
        comments: post.comments_count,
        url: post.permalink,
        timestamp: post.timestamp,
        platform: 'instagram',
      }))

    // Combine and sort all fetched posts by timestamp (newest first)
    let allFetchedPosts = [...facebookPosts, ...instagramPosts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Apply content filtering if content parameter is provided
    if (content && content.trim() !== '') {
      const searchTerm = content.toLowerCase().trim()
      allFetchedPosts = allFetchedPosts.filter(
        (post) =>
          post.content.toLowerCase().includes(searchTerm) ||
          post.username.toLowerCase().includes(searchTerm)
      )
    }

    // Apply pagination to the filtered posts
    const startIndex = (currentPage - 1) * postsPerPage
    const endIndex = startIndex + postsPerPage
    const paginatedPosts = allFetchedPosts.slice(startIndex, endIndex)

    // Format timestamps for display
    const posts = paginatedPosts.map((post) => ({
      ...post,
      timestamp: formatDate(post.timestamp, locale),
    }))

    // Calculate pagination info
    const fetchedCount = allFetchedPosts.length
    const reachedEnd = fetchedCount < fetchLimit * 0.8
    const totalCount = allFetchedPosts.length
    const totalPages = Math.ceil(allFetchedPosts.length / postsPerPage)

    return {
      posts,
      totalCount,
      totalPages,
      currentPage,
      fetchedCount,
      isEstimated: !reachedEnd,
      hasMorePages: !reachedEnd || currentPage < totalPages,
    }
  } catch (error) {
    console.error('Error fetching paginated social media posts:', error.message)
    return {
      posts: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      fetchedCount: 0,
      isEstimated: false,
      hasMorePages: false,
    }
  }
}

// Cached version for ISR (use this in Server Components)
export const getCachedSocialMediaPostsPaginated = unstable_cache(
  async (
    locale: 'en' | 'vi' | 'fr' = 'en',
    currentPage: number = 1,
    postsPerPage: number = 6,
    content: string = ''
  ): Promise<{
    posts: SocialMediaPost[]
    totalCount: number
    totalPages: number
    currentPage: number
    fetchedCount: number
    isEstimated: boolean
    hasMorePages: boolean
  }> => {
    try {
      // Fetch enough posts for current page + buffer
      const fetchLimit = 100

      // Fetch posts from both platforms in parallel
      const [fbRes, igRes] = await Promise.all([
        fetch(
          `https://graph.facebook.com/v22.0/${FACEBOOK_PAGE_ID}/posts?fields=id,message,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true)&limit=${fetchLimit}&access_token=${FACEBOOK_ACCESS_TOKEN}`
        ),
        fetch(
          `https://graph.facebook.com/v22.0/${INSTAGRAM_ID}/media?fields=id,caption,media_url,media_type,permalink,timestamp,thumbnail_url,like_count,comments_count&limit=${fetchLimit}&access_token=${FACEBOOK_ACCESS_TOKEN}`
        ),
      ])

      const [fbJson, igJson] = await Promise.all([fbRes.json(), igRes.json()])

      // Process Facebook posts
      const facebookPosts: SocialMediaPost[] = (fbJson.data || [])
        .filter(
          (post: FacebookPostResponse) =>
            post.message?.trim() !== '' &&
            post.message !== null &&
            post.message !== undefined
        )
        .map((post: FacebookPostResponse) => ({
          id: `fb_${post.id}`,
          username: 'vietvibe',
          content: post.message || '',
          image: post.full_picture || '',
          likes: post.likes?.summary?.total_count || 0,
          comments: post.comments?.summary?.total_count || 0,
          url: post.permalink_url,
          timestamp: post.created_time,
          platform: 'facebook',
        }))

      // Process Instagram posts
      const instagramPosts: SocialMediaPost[] = (igJson.data || [])
        .filter(
          (post: InstagramMediaResponse) =>
            post.caption?.trim() !== '' &&
            post.caption !== null &&
            post.caption !== undefined
        )
        .map((post: InstagramMediaResponse) => ({
          id: `ig_${post.id}`,
          username: 'vietvibe',
          content: post.caption || '',
          image:
            post.media_type === 'VIDEO'
              ? post.thumbnail_url || post.media_url
              : post.media_url,
          likes: post.like_count,
          comments: post.comments_count,
          url: post.permalink,
          timestamp: post.timestamp,
          platform: 'instagram',
        }))

      // Combine and sort all fetched posts by timestamp (newest first)
      let allFetchedPosts = [...facebookPosts, ...instagramPosts].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      // Apply content filtering if provided
      if (content && content.trim() !== '') {
        const searchTerm = content.toLowerCase().trim()
        allFetchedPosts = allFetchedPosts.filter(
          (post) =>
            post.content.toLowerCase().includes(searchTerm) ||
            post.username.toLowerCase().includes(searchTerm)
        )
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * postsPerPage
      const endIndex = startIndex + postsPerPage
      const paginatedPosts = allFetchedPosts.slice(startIndex, endIndex)

      // Format timestamps
      const posts = paginatedPosts.map((post) => ({
        ...post,
        timestamp: formatDate(post.timestamp, locale),
      }))

      // Calculate pagination info
      const fetchedCount = allFetchedPosts.length
      const reachedEnd = fetchedCount < fetchLimit * 0.8
      const totalCount = allFetchedPosts.length
      const totalPages = Math.ceil(allFetchedPosts.length / postsPerPage)

      return {
        posts,
        totalCount,
        totalPages,
        currentPage,
        fetchedCount,
        isEstimated: !reachedEnd,
        hasMorePages: !reachedEnd || currentPage < totalPages,
      }
    } catch (error) {
      console.error(
        'Error fetching cached paginated social media posts:',
        error.message
      )
      return {
        posts: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        fetchedCount: 0,
        isEstimated: false,
        hasMorePages: false,
      }
    }
  },
  ['social-media-posts'],
  {
    revalidate: 600, // Cache for 10 minutes (external API calls are expensive)
    tags: ['social-posts'],
  }
)
