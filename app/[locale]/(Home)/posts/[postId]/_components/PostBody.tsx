import React from 'react'
import Image from 'next/image'
import moment from 'moment-timezone'
import TextPreview from '../../../../../../components/quill/TextPreview'
import PostStats from '../../_components/PostStats'
import { Button } from '@/components/ui/button'
interface PostBodyProps {
  title: string
  summary: string
  content: string
  imageUrl: string
  createdAt: Date
  author: string
  postLikes: number
  postViews: number
  hasLiked: boolean
  hasViewed: boolean
  postId: string
  userId: string | null
}

const PostBody = ({
  title,
  summary,
  content,
  imageUrl,
  author,
  createdAt,
  postLikes,
  postViews,
  hasLiked,
  hasViewed,
  postId,
  userId,
}: PostBodyProps) => {
  const vancouverTimeZone = 'America/Vancouver'
  const formattedCreatedAt = moment(createdAt)
    .tz(vancouverTimeZone)
    .format('YYYY-MM-DD [at] HH:mm:ss')
  
  return (
    <div className="flex-col-center gap-y-4 p-6 md:p-12 lg:p-16">
      <h1 className="mb-2 text-4xl font-bold text-textColor hover:text-textColor/80 md:text-5xl lg:text-6xl text-center">
        {title}
      </h1>
      <p className="md:text-lg lg:text-xl text-muted-foreground text-center">
        {summary}
      </p>
      <span className="text-sm text-muted-foreground">
        {formattedCreatedAt}
      </span>
      <span className="text-sm">
        By <span className="font-semibold">{author}</span>
      </span>
      <div className="relative aspect-video h-[100%] w-[100%] overflow-hidden rounded-lg">
        {imageUrl ? (
          <div className="relative aspect-video h-[100%] w-[100%] overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt={title}
              fill
              loading="eager"
              className="hover-focus-zoomIn absolute object-cover"
            />
          </div>
        ) : null}
      </div>
      <div className="mt-4 w-full text-pretty">
        <TextPreview value={content} />
      </div>
      <Button
        asChild
        variant="outline"
        className={`flex group h-auto max-w-[60px] justify-center items-center bg-bgColor-gray100 hover:bg-bgColor-gray300`}
      >
        <div className="w-full">
          <PostStats
            postLikes={postLikes}
            postViews={postViews}
            hasLiked={hasLiked}
            hasViewed={hasViewed}
            postId={postId}
            userId={userId}
            triggerLikeOnContainerClick
          />
        </div>
      </Button>
    </div>
  )
}

export default PostBody
