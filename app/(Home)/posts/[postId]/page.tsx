import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import PostBody from './_components/PostBody'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
interface PostPageProps {
  params: Promise<{ postId: string }>
}
const PostPage = async ({ params }: PostPageProps) => {
  const { postId } = await params
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
  //   todo create a not found page

  return (
    <div className="mx-auto flex max-w-7xl flex-col my-20">
      {/* <Link href="/posts" className='p-6'>
        <Button variant={'ghost'} className="bg-[#620BC4] flex items-center gap-x-2">
          <ArrowLeft className="h-6 w-6" />
          Go back
        </Button>
      </Link> */}
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
