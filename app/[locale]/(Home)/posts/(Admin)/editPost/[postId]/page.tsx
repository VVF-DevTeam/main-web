import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import TitleForm from '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/TitleForm'
import PostSummary from '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/SummaryForm'
import { BookType, BookText, FileText, FileImage } from 'lucide-react'
import PostImage from '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/ImageForm'
import PostContent from '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/ContentForm'
import { Button } from '@/components/ui/button'
import PublishButton from '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/PublishButton'
import { adminCheck } from '@/lib/dbQueries/adminCheck'

interface EditPostProps {
  params: Promise<{ postId: string }>
}
const EditPost = async ({ params }: EditPostProps) => {
  // check if the current user is an admin to allow access to the post control page
  if ((await adminCheck()) === false) {
    return redirect('/posts')
  }

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
  
  return (
    <div className="my-12 p-6 lg:my-20">
      <div className="mx-auto my-20 max-w-7xl">
        {/* Header */}
        <div className="mb-24 flex-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-semibold text-textColor lg:text-4xl">
              Edit Post
            </h1>
            <p className="text-muted-foreground text-sm">
              Fill all the fields to edit your post.
            </p>
            <p className="text-muted-foreground text-sm">
              Steps completed: ({completedSteps} / {postFields.length})
            </p>
          </div>
          <div className="flex-col-center gap-x-4 gap-y-4 md:flex-row">
            {/* TODO: Add delete button */}
            {/* Buttons */}
            <Button variant={'destructive'}>Delete Post</Button>
            <PublishButton
              id={post.id}
              canPublish={canPublish}
              isPublished={post.isPublished!}
              type="post"
              domain="posts"
            />
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-y-12">
          {/* Step I & Step II */}
          <div className="flex-col-default md:flex-row">
            <div className="flex-col-default w-full">
              <div className="flex items-center gap-x-4">
                <BookType className="h-6 w-6 md:h-8 md:w-8" />
                <h1 className="text-xl font-semibold md:text-2xl">
                  <span className="text-muted-foreground"> Step I : </span>Title
                </h1>
              </div>
              <TitleForm post={post} />
            </div>
            <div className="flex-col-default w-full">
              <div className="flex items-center gap-x-4">
                <BookText className="h-6 w-6 md:h-8 md:w-8" />
                <h1 className="text-xl font-semibold md:text-2xl">
                  <span className="text-muted-foreground"> Step II : </span>{' '}
                  Summary
                </h1>
              </div>
              <PostSummary post={post} />
            </div>
          </div>

          {/* Step III */}
          <div className="flex-col-default w-full">
            <div className="flex items-center gap-x-4">
              <FileImage className="h-6 w-6 md:h-8 md:w-8" />
              <h1 className="text-xl font-semibold md:text-2xl">
                <span className="text-muted-foreground"> Step III : </span>{' '}
                Image
              </h1>
            </div>
            <PostImage post={post} />
          </div>

          {/* Step IV */}
          <div className="flex-col-default w-full">
            <div className="flex items-center gap-x-4">
              <FileText className="h-6 w-6 md:h-8 md:w-8" />
              <h1 className="text-xl font-semibold md:text-2xl">
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
