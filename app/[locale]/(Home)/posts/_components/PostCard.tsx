import React from 'react'
import Image from 'next/image'
import { ArrowBigRightDash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PostStats from './PostStats'
import Link from 'next/link'
interface PostProps {
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

const PostCard = ({
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
}: PostProps) => {
  return (
    <div className="flex-col-default h-full w-full overflow-hidden rounded-md border bg-background-alt shadow-lg hover:bg-[#F2E3D5] md:grid md:grid-cols-[30%_70%] md:gap-x-10 lg:gap-x-12">
      {/*Column1 - Image */}
      <div className="relative aspect-video h-full w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="absolute object-cover hover-focus-image"
        />
      </div>

      {/* Column2 - Content title createdAt */}
      <div className="flex-col-default flex-wrap px-4 py-8 xl:px-8 xl:py-10">
        <h2 className="text-2xl font-bold tracking-wide xl:text-3xl">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm">
          {createdAt.toLocaleString()}
        </p>
        <p className="mt-4 text-wrap break-words text-textColor-gray md:max-w-[90%]">
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

          <Link href={`posts/${id}`} className="group ml-auto mt-auto md:pr-12">
            <Button
              variant={'ghost'}
              className="flex-center gap-x-2 button-default text-sm md:text-base"
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

export default PostCard

// Add author name on post schema.
