import React from 'react'
import Image from 'next/image'
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
    <div className="w-full flex flex-col items-center gap-y-4 p-12 lg:p-16">
      <h1 className="mb-2 text-4xl font-bold text-[#1B171A] hover:text-[#1B171A]/80 md:text-5xl lg:text-6xl">
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
          className="absolute object-cover hover:scale-110 duration-500 ease-in-out"
        />
      </div>
      <p className='mt-4 text-[#1B171A]'>{content}</p>
    </div>
  )
}

export default PostBody
