import { SocialMediaPost } from '@/lib/types/socialMediaPostsType'

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
      `https://graph.facebook.com/v22.0/${FACEBOOK_PAGE_ID}/posts?fields=id,message,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true)&access_token=${FACEBOOK_ACCESS_TOKEN}`
    )
    const fbJson = await fbRes.json()

    const facebookPosts: SocialMediaPost[] = (fbJson.data || [])
      .map((post: FacebookPostResponse, index: number) => ({
        id: index,
        username: 'vietvibe',
        content: post.message || '',
        image: post.full_picture || '',
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        url: post.permalink_url,
        timestamp: post.created_time,
        platform: 'facebook',
      }))

    // 2. Fetch Instagram Posts
    const igRes = await fetch(
      `https://graph.facebook.com/v22.0/${INSTAGRAM_ID}/media?fields=id,caption,media_url,media_type,permalink,timestamp,thumbnail_url,like_count,comments_count&access_token=${FACEBOOK_ACCESS_TOKEN}`
    )
    const igJson = await igRes.json()

    const instagramPosts: SocialMediaPost[] = (igJson.data || [])
      .map((post: InstagramMediaResponse, index: number) => ({
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
      }))

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
