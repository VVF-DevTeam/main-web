// Libraries
import React from 'react'

// Components
import Image from 'next/image'
import { ArrowBigRightDash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PostStats from './PostStats'
import Link from 'next/link'

// Interfaces
interface PostCardHorizontalProps {
  id: string
  title: string
  imageUrl: string
  createdAt: Date
  summary: string
  postLikes: number
  postViews: number
  hasLiked: boolean
  hasViewed: boolean
  userId: string | null
}

// Main Component
const PostCardHorizontal = ({
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
}: PostCardHorizontalProps) => {
  return (
    <div className="flex flex-col justify-center items-center w-full gap-y-1 overflow-hidden rounded-md border bg-[#FEFAF4] shadow-lg hover:bg-[#F2E3D5] lg:grid lg:grid-cols-[28%_1fr] lg:gap-x-8 lg:gap-y-6 xl:gap-x-10">
      {/*Column1 - Image */}
      <div className="relative aspect-video h-full w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Thumbnail for ${title} post`}
          fill
          priority={true}
          sizes="(min-width: 1280px) 426px, (min-width: 780px) 396px, (min-width: 400px) calc(100vw - 98px), calc(13.75vw + 230px)"
          className="hover-focus-zoomIn object-cover"
        />
      </div>

      {/* Column2 - Content title createdAt */}
      <div className="flex-col-default flex-wrap gap-y-3 px-4 py-8 md:gap-y-4 md:py-6 lg:px-4 xl:px-6 xl:py-8">
        <h2 className="text-2xl font-bold tracking-wide xl:text-3xl">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {createdAt.toLocaleString()}
        </p>
        <p className="mt-1 text-wrap break-words text-textColor-gray500 md:mt-2 md:max-w-[90%]">
          {summary}
        </p>
        <div className="flex-between">
          {/* Post stats */}
          <PostStats
            postLikes={postLikes}
            hasLiked={hasLiked}
            postId={id}
            userId={userId}
            postViews={postViews}
            hasViewed={hasViewed}
          />

          <Link href={`posts/${id}`} className="group ml-auto mt-auto md:pr-4 lg:pr-2 xl:pr-4">
            <Button
              variant={'default'}
              className="flex-center gap-x-2 text-sm md:text-base"
            >
              <span>Read More</span>
              <ArrowBigRightDash className="h-5 w-5 duration-100 ease-in group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PostCardHorizontal

// Add author name on post schema.
