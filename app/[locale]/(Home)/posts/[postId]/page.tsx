// Libraries
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

// Components
import PostBody from '@/app/[locale]/(Home)/posts/[postId]/_components/PostBody'
import BackButton from '@/components/ui/back-button'

// Interfaces
interface PostPageProps {
  params: Promise<{ postId: string }>
}

// Main Component
const PostPage = async ({ params }: PostPageProps) => {
  const { postId } = await params
  const session = await auth()

  if (!postId) return redirect('/')

  // get the post along with author
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })
  if (!post) return null

  const isLoggedIn = session?.user?.id
  let isVisited = null

  if (isLoggedIn) {
    isVisited = await prisma.user.findUnique({
      where: {
        id: session?.user?.id || '',
      },
      select: {
        visitedPosts: {
          where: {
            postId: postId,
            userId: session?.user?.id || '',
          },
        },
      },
    })
    if (isVisited && isVisited.visitedPosts.length === 0) {
      await prisma.postVisits.create({
        data: {
          postId: postId,
          userId: session?.user?.id!,
        },
      })
    }
  }

  //   todo create a not found page
  return (
    <div className="mx-auto my-20 flex max-w-7xl flex-col gap-y-7">
      <BackButton variant={'responsive'} />
      <PostBody
        title={post.title}
        summary={post.summary!}
        createdAt={post.createdAt}
        content={post.content!}
        imageUrl={post.imgUrl!}
        author={post.user.name!}
      />
    </div>
  )
}

export default PostPage
