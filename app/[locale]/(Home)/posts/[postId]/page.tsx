import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import PostBody from '@/app/[locale]/(Home)/posts/[postId]/_components/PostBody'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/auth'

interface PostPageProps {
  params: Promise<{ postId: string }>
}
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
      console.log(isVisited.visitedPosts)
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
    <div className="mx-auto my-20 flex max-w-7xl flex-col">
      <Link href="/posts" className="p-6">
        <Button
          variant={'ghost'}
          className="flex items-center gap-x-2 bg-bgColor-brand text-textColor-white transition-all hover:bg-bgColor-brand/70 hover:text-slate-200"
        >
          <ArrowLeft className="h-6 w-6" />
          Go back
        </Button>
      </Link>
      <PostBody
        title={post.title}
        createdAt={post.createdAt}
        content={post.content!}
        imageUrl={post.imgUrl!}
        author={post.user.name!}
      />
    </div>
  )
}

export default PostPage
