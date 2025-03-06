import React from 'react'
import Image from 'next/image'
import TextPreview from '../../(Admin)/editPost/[postId]/_components/TextPreview'
interface PostBodyProps {
  title: string
  content: string
  imageUrl: string
  createdAt: Date
  author: string
}

const PostBody = ({
  title,
  content,
  imageUrl,
  author,
  createdAt,
}: PostBodyProps) => {
  return (
    <div className="flex-col-center gap-y-4 p-6 md:p-12 lg:p-16">
      <h1 className="mb-2 text-4xl font-bold text-textColor hover:text-textColor/80 md:text-5xl lg:text-6xl">
        {title}
      </h1>
      <span className="text-sm text-muted-foreground">
        {createdAt.toLocaleString()}
      </span>
      <span className="text-sm">
        By <span className="font-semibold">{author}</span>
      </span>
      <div className="relative aspect-video h-[100%] w-[100%] overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={title}
          fill
          loading="eager"
          className="absolute object-cover hover-focus-zoomIn"
        />
      </div>
      <div className="mt-4 w-full text-pretty">
        <TextPreview value={content} />
      </div>
    </div>
  )
}

export default PostBody
