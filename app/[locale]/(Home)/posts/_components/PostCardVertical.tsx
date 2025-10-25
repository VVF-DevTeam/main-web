// Libraries
import React from 'react'

// Components
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PostStats from './PostStats'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

// Interfaces
interface PostCardVerticalProps {
  id: string
  title: string
  imageUrl: string
  createdAt: Date
  summary: string
  postLikes?: number
  postViews?: number
  hasLiked?: boolean
  hasViewed?: boolean
  userId?: string | null
  isNew?: boolean
  showStats?: boolean
}

// Main Component
const PostCardVertical = ({
  title,
  summary,
  imageUrl,
  createdAt,
  id,
  postLikes,
  postViews,
  hasLiked,
  hasViewed,
  userId,
  isNew = false,
  showStats = false,
}: PostCardVerticalProps) => {
  return (
    <div className="group relative flex w-[calc(100%-3px)] max-w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:scale-105">
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Thumbnail for ${title} post`}
          fill
          priority={false}
          sizes="(min-width: 1280px) 400px, (min-width: 1024px) 350px, (min-width: 768px) 300px, 100vw"
          className="hover-focus-zoomIn object-cover"
        />
        
        {/* New Badge */}
        {isNew && (
          <div className="absolute left-3 top-3">
            <Badge 
              variant="secondary" 
              className="bg-white px-3 py-1 text-sm font-semibold shadow-md"
            >
              New
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-y-3 px-6 py-5">
        {/* Title */}
        <h2 className="line-clamp-2 h-[3.5rem] text-xl font-semibold tracking-wide">
          {title}
        </h2>

        {/* Summary */}
        <p className="line-clamp-2 flex-1 text-sm text-textColor-gray md:text-base">
          {summary}
        </p>

        {/* Date */}
        <p className="text-xs text-muted-foreground md:text-sm">
          {createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>

        {/* Post Stats */}
        {showStats && postLikes && postViews && hasLiked && hasViewed && userId && (
        <div className="mb-2">
          <PostStats
            postLikes={postLikes}
            hasLiked={hasLiked}
            postId={id}
            userId={userId}
            postViews={postViews}
            hasViewed={hasViewed}
          />
        </div>
        )}

        {/* Read More Link */}
        <Link href={`posts/${id}`} className="mt-auto">
          <Button
            variant={'ghost'}
            className="group/link flex items-center gap-x-2 p-0 text-[#C41E3A] hover:text-[#A01829] place-self-end"
          >
            <span className="button-bold">Read More</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 ease-in group-hover/link:-translate-y-1 group-hover/link:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PostCardVertical


