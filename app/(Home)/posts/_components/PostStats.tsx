'use client'
import React from 'react'
import { ThumbsUp } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
interface PostStatsProps {
  postLikes: number
  hasLiked: boolean
  postId: string
  userId: string | null
}
const PostStats = ({ postLikes, hasLiked, postId, userId }: PostStatsProps) => {
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
    <div>
      <button
        onClick={() => updateLikes(hasLiked ? 'unlike' : 'like')}
        className="group flex items-center justify-center gap-x-1 text-sm text-muted-foreground lg:gap-x-2"
      >
        <ThumbsUp
          className={cn(
            hasLiked
              ? 'h-4 w-4 fill-sky-400 text-black transition-all duration-100 ease-out group-hover:translate-y-[-2px] group-hover:rotate-[-5deg] group-hover:fill-blue-700/80'
              : 'h-4 w-4 text-black transition-all duration-100 ease-out group-hover:translate-y-[-2px] group-hover:rotate-[-5deg] group-hover:fill-red-700/80'
          )}
        />{' '}
        {postLikes}
      </button>
    </div>
  )
}

export default PostStats
