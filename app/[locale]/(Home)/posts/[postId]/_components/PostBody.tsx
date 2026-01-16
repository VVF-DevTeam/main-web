import React from 'react'
import Image from 'next/image'
import TextPreview from '../../../../../../components/quill/TextPreview'
interface PostBodyProps {
  title: string
  summary: string
  content: string
  imageUrl: string
  createdAt: Date
  author: string
}

const PostBody = ({
  title,
  summary,
  content,
  imageUrl,
  author,
  createdAt,
}: PostBodyProps) => {
  return (
    <div className="flex-col-center gap-y-4 p-6 md:p-12 lg:p-16">
      <h1 className="mb-2 text-4xl font-bold text-textColor hover:text-textColor/80 md:text-5xl lg:text-6xl text-center">
        {title}
      </h1>
      <p className="md:text-lg lg:text-xl text-muted-foreground text-center">
        {summary}
      </p>
      <span className="text-sm text-muted-foreground">
        {createdAt.toLocaleString()}
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
    </div>
  )
}

export default PostBody
