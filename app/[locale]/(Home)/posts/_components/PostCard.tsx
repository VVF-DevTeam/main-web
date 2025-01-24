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
    <div className="grid h-full w-full gap-x-6 overflow-hidden rounded-md border bg-slate-50 shadow-lg transition-all duration-200 ease-in hover:bg-slate-100/90 md:grid-cols-[30%_70%] md:gap-x-8 lg:gap-x-12">
      {/*Column1 - Image */}
      <div className="relative aspect-video h-full w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="absolute object-cover duration-500 ease-in-out hover:scale-110"
        />
      </div>

      {/* Column2 - Content title createdAt */}
      <div className="flex flex-col flex-wrap gap-y-6 px-4 py-8 xl:px-8 xl:py-10">
        <h2 className="text-2xl font-bold tracking-wide xl:text-3xl">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {createdAt.toLocaleString()}
        </p>
        <p className="mt-4 text-wrap break-words text-slate-700 md:max-w-[90%]">
          {summary}
        </p>
        <div className="flex items-center justify-between">
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
              className="flex items-center gap-x-2 bg-[#620BC4] text-sm text-white hover:bg-[#620BC4]/90 hover:text-white/90 md:text-base"
            >
              <span>Read More</span>
              <ArrowBigRightDash className="h-5 w-5 duration-100 ease-in group-hover:translate-x-1 group-hover:text-red-500" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PostCard

// Add author name on post schema.
