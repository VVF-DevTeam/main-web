import React from 'react'
import Image from 'next/image'
import { ArrowBigRightDash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
interface PostProps {
  id: string
  title: string
  content: string
  imageUrl: string
  createdAt: Date
}

const PostCard = ({ title, content, imageUrl, createdAt, id }: PostProps) => {
  return (
    <div className="trasnsition-all grid w-full gap-x-6 overflow-hidden rounded-md border bg-slate-50 shadow-lg duration-200 ease-in hover:bg-slate-100/90 md:grid-cols-[40%_60%] md:gap-x-8 lg:gap-x-12">
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
        <p className="mt-4 max-w-[100%] text-wrap break-words text-slate-700">
          {content}
        </p>
        <Link href={`posts/${id}`} className="group ml-auto mt-auto md:pr-12">
          <Button
            variant={'ghost'}
            className="flex items-center gap-x-2 bg-[#620BC4] text-sm text-white hover:bg-[#620BC4]/90 hover:text-white/90 md:text-base"
          >
            <span>Read More</span>
            <ArrowBigRightDash className="group-hover:translate-x-1 h-5 w-5 duration-100 ease-in group-hover:text-red-500" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PostCard

// Add author name on post schema.
