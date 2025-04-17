import { SocialMediaPost } from '@/lib/types/socialMediaPostsType'

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_APP_ID as string
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

export const getFacebookPosts = async (): Promise<SocialMediaPost[]> => {
  const url = `https://graph.facebook.com/v22.0/${FACEBOOK_PAGE_ID}/posts?fields=id,message,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true)&access_token=${FACEBOOK_ACCESS_TOKEN}`

  try {
    const res = await fetch(url)
    const json = await res.json()

    if (!json.data) {
      throw new Error(json.error?.message || 'Failed to fetch Facebook posts.')
    }

    const posts: SocialMediaPost[] = json.data
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
      .filter((post: SocialMediaPost) => post.content.trim() !== '') // Filter out empty content

    return posts
  } catch (error) {
    console.error('Error fetching Facebook posts:', error.message)
    return []
  }
}
