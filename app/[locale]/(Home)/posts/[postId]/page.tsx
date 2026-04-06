// Libraries
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Metadata } from 'next'
import { getPostById } from '@/lib/actions/post/getPosts'

// Components
import PostBody from '@/app/[locale]/(Home)/posts/[postId]/_components/PostBody'
import BackButton from '@/components/ui/back-button'
// Interfaces
interface PostPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>
}): Promise<Metadata> {
  const { postId } = await params
  const post = await getPostById(postId)
  return {
    title: post?.title,
    description: post?.summary ?? 'Read the latest post from Viet Vibe Foundation',
    openGraph: {
      title: post?.title,
      description: post?.summary ?? 'Read the latest post from Viet Vibe Foundation',
      images: {
        url: post?.imgUrl!,
        alt: post?.title,
      },
    },
  }
}

// Main Component
const PostPage = async ({ params }: PostPageProps) => {
  const { postId } = await params
  const session = await auth()

  if (!postId) return redirect('/')

  // get the post along with author
  const post = await getPostById(postId)
  if (!post) return null

  const isLoggedIn = session?.user?.id
  let isVisited = null

  if (isLoggedIn) {
    try {
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
    } catch (error) {
      console.error('[POST VISIT ERROR]', error)
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
