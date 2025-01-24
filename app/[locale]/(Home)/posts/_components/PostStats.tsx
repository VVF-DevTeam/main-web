'use client'
import React from 'react'
import { ThumbsUp, Eye } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface PostStatsProps {
  postLikes: number
  postViews: number
  hasLiked: boolean
  hasViewed: boolean
  postId: string
  userId: string | null
}
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
        className="group flex items-center justify-center gap-x-1 rounded-2xl border-none border-black bg-[#909394]/20 p-[9px] text-sm text-muted-foreground lg:gap-x-2"
      >
        <ThumbsUp
          className={cn(
            hasLiked
              ? 'h-4 w-4 fill-sky-300 text-black transition-all duration-100 ease-out group-hover:translate-y-[-2px] group-hover:rotate-[-5deg] group-hover:fill-blue-700/80'
              : 'h-4 w-4 text-black transition-all duration-100 ease-out group-hover:translate-y-[-2px] group-hover:rotate-[-5deg] group-hover:fill-red-700/80'
          )}
        />{' '}
        <span className="text-xs font-semibold text-foreground">
          {postLikes}
        </span>
      </button>

      <div className="group flex items-center justify-center gap-x-1 rounded-2xl border-none border-black bg-[#909394]/20 p-[9px] text-sm text-muted-foreground lg:gap-x-2">
        <Eye
          className={cn(
            hasViewed
              ? 'h-4 w-4 text-sky-700 transition-all duration-100 ease-out group-hover:scale-110 group-hover:fill-blue-700/80'
              : 'h-4 w-4 text-black transition-all duration-100 ease-out group-hover:scale-110 group-hover:fill-red-700/80'
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
