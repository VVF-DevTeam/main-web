'use client'

// Libraries
import React from 'react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

// Components
import { ThumbsUp, ChartNoAxesColumn } from 'lucide-react'

// Interfaces
interface PostStatsProps {
  postLikes: number
  postViews: number
  hasLiked: boolean
  hasViewed: boolean
  postId: string
  userId: string | null
}

// Main Component
const PostStats = ({
  postLikes,
  hasLiked,
  postId,
  userId,
  hasViewed,
  postViews,
}: PostStatsProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const updateLikes = async (action: 'like' | 'unlike') => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to like a post',
      })
      return
    }

    try {
      await axios.patch(`/api/posts/likes/${postId}`, {
        userId: userId,
        action: action,
      })

      toast({
        variant: 'default',
        title: 'Success',
        description: `You have ${action === 'like' ? 'liked' : 'unliked'} this post`,
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    }
  }
  return (
    <div className="flex items-center gap-x-6 text-sm text-muted-foreground">
      <button
        onClick={() => updateLikes(hasLiked ? 'unlike' : 'like')}
        className="flex-center group gap-x-1 rounded-2xl border-none border-bgColor-black bg-bgColor-gray/10 p-[9px] text-sm text-muted-foreground lg:gap-x-2"
        aria-label={hasLiked ? 'Unlike post' : 'Like post'}
      >
        <ThumbsUp
          className={cn(
            'h-4 w-4 text-black transition-all duration-100 ease-out group-hover:translate-y-[-2px] group-hover:rotate-[-5deg]',
            hasLiked
              ? 'fill-sky-400 group-hover:fill-blue-700/80'
              : 'group-hover:fill-red-700/80'
          )}
        />{' '}
        <span className="text-xs font-semibold text-foreground">
          {postLikes}
        </span>
      </button>

      <div
        className="flex-center group gap-x-1 rounded-2xl border-none border-bgColor-black bg-bgColor-gray/10 p-[9px] text-sm text-muted-foreground lg:gap-x-2"
        aria-label="Post views"
      >
        <ChartNoAxesColumn
          className={cn(
            'h-4 w-4 transition-all duration-100 ease-out group-hover:scale-110',
            hasViewed ? 'text-sky-700' : 'text-black'
          )}
        />
        <span className="text-xs font-semibold text-foreground">
          {postViews}
        </span>
      </div>
    </div>
  )
}

export default PostStats
