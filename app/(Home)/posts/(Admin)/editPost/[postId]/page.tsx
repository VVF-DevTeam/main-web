import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import TitleForm from './_components/TitleForm'

import PostSummary from './_components/SummaryForm'
import { BookType, BookText, FileText, FileImage } from 'lucide-react'
import PostImage from './_components/ImageForm'
import PostContent from './_components/ContentForm'
import { Button } from '@/components/ui/button'
interface EditPostProps {
  params: Promise<{ postId: string }>
}
const EditPost = async ({ params }: EditPostProps) => {
  // TODO: Check if user is admin
  const { postId } = await params

  // Fetch post by id from database
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  })

  if (!post) {
    return redirect('/posts')
  }

  const postFields = [
    !!post.title,
    !!post.summary,
    !!post.content,
    !!post.imgUrl,
  ]

  const completedSteps = postFields.filter(Boolean).length
  const canPublish = completedSteps === postFields.length
  const completionText = `(${completedSteps} / ${postFields.length})`
  return (
    <div className="my-12 p-6 lg:my-20">
      <div className="mx-auto my-20 max-w-7xl">
        {/* Header */}
        <div className="mb-24 flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-semibold text-[#1B171A] lg:text-4xl">
              Edit Post
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill all the fields to edit your post.
            </p>
            <p className='text-sm text-muted-foreground'>Steps completed: {completionText}</p>
          </div>
          <div className="flex flex-col gap-y-4 md:flex-row items-center gap-x-4">
            {/* Buttons */}
            <Button variant={'destructive'}>Delete Post</Button>
            <Button variant={'default'} disabled={!canPublish}>
              {!post.isPublished? "Publish": "Unpublish"}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-y-12">
          {/* First Row */}
          <div className="flex flex-col gap-x-8 md:flex-row">
            <div className="flex w-full flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <BookType className="h-6 w-6 md:h-8 md:w-8" />
                <h1 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                  <span className="text-muted-foreground"> Step I : </span>Title
                </h1>
              </div>
              <TitleForm post={post} />
            </div>
            <div className="flex w-full flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <BookText className="h-6 w-6 md:h-8 md:w-8" />
                <h1 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                  <span className="text-muted-foreground"> Step II : </span>{' '}
                  Summary
                </h1>
              </div>
              <PostSummary post={post} />
            </div>
          </div>

          {/* Second Row */}
          <div className="flex w-full flex-col gap-y-4">
            <div className="flex items-center gap-x-4">
              <FileImage className="h-6 w-6 md:h-8 md:w-8" />
              <h1 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                <span className="text-muted-foreground"> Step III : </span>{' '}
                Image
              </h1>
            </div>
            <PostImage post={post} />
          </div>
          {/* Third Row */}
          <div className="flex w-full flex-col gap-y-4">
            <div className="flex items-center gap-x-4">
              <FileText className="h-6 w-6 md:h-8 md:w-8" />
              <h1 className="text-xl font-semibold md:text-2xl lg:text-3xl">
                <span className="text-muted-foreground"> Step IV : </span>{' '}
                Content
              </h1>
            </div>
            <PostContent post={post} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPost
