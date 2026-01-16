'use client'

// Libraries
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Components
import { ThumbsUp } from 'lucide-react'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

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
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const [isLoading, setIsLoading] = useState(false)

  // Local state for immediate UI updates (optimistic updates)
  const [localHasLiked, setLocalHasLiked] = useState(hasLiked)
  const [localPostLikes, setLocalPostLikes] = useState(postLikes)

  const updateLikes = async (action: 'like' | 'unlike') => {
    if (!userId) {
      toast.error('You must be logged in to like this post', {
        description: (
          <div className="flex flex-col gap-2">
            <span>Please log in to like this post, thank you.</span>
            <button
              onClick={() => router.push('/signIn')}
              className="text-left font-medium text-blue-500 underline hover:text-blue-700"
            >
              Click here to sign in
            </button>
          </div>
        ),
        style: {
          color: '#ef4444',
        },
      })
      return
    }

    if (isLoading) {
      return // Prevent multiple clicks
    }

    setIsLoading(true)

    // Optimistic update - update UI immediately
    const newHasLiked = action === 'like'
    const newLikeCount =
      action === 'like' ? localPostLikes + 1 : localPostLikes - 1
    setLocalHasLiked(newHasLiked)
    setLocalPostLikes(newLikeCount)

    try {
      await axiosInstance.patch(`/api/posts/likes/${postId}`, {
        userId: userId,
        action: action,
      })

      toast.success(
        `You have successfully ${action === 'like' ? 'liked' : 'unliked'} this post`,
        {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e', // green-500 color
          },
        }
      )
      router.refresh()
    } catch (error) {
      console.log(error)

      // Revert optimistic update on error
      setLocalHasLiked(hasLiked)
      setLocalPostLikes(postLikes)

      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex items-center gap-x-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-x-1">
        <button
          onClick={() => updateLikes(localHasLiked ? 'unlike' : 'like')}
          disabled={isLoading}
          className={cn(
            'flex-center group gap-x-1 rounded-2xl border-none border-bgColor-black p-[6px] text-sm text-muted-foreground transition-opacity',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          aria-label={localHasLiked ? 'Unlike post' : 'Like post'}
        >
          <ThumbsUp
            className={cn(
              'h-4 w-4 text-black transition-all duration-100 ease-out group-hover:translate-y-[-2px] group-hover:rotate-[-5deg]',
              localHasLiked
                ? 'fill-bgColor-brand600/70 group-hover:fill-bgColor-brand900/70'
                : 'fill-white/70 group-hover:fill-bgColor-brand600/70'
            )}
          />{' '}
        </button>
        <span className="text-xs font-semibold text-foreground mt-1">
          {localPostLikes}
        </span>
      </div>
      {/* <div
        className="flex-center group gap-x-1 rounded-2xl border-none border-bgColor-black bg-bgColor-gray100 p-[9px] text-sm text-muted-foreground lg:gap-x-2"
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
      </div> */}
    </div>
  )
}

export default PostStats
