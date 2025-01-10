import PostList from './_components/PostList'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
const Posts = async () => {
  const publishedPosts = await prisma.post.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })


  return (
    <div className="flex flex-col gap-y-6 my-20">
      <PostList posts={publishedPosts} />
      {/* TODO: Add button to create a new post only for admins */}
      <div className="flex w-full items-center justify-end gap-x-4 px-6">
        <Link href="/posts/allPosts" className="group mb-2 py-6">
          <Button
            variant={'ghost'}
            className="flex items-center gap-x-2 bg-slate-200 p-6 text-black hover:bg-slate-300/90 hover:text-black/90"
          >
            <ArrowRight className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
            <span className="text-xl">All Posts</span>
          </Button>
        </Link>

        <Link href="/posts/createNewPost" className="group mb-2  py-6">
          <Button
            variant={'ghost'}
            className="flex items-center gap-x-2 bg-[#1B171A] p-6 text-slate-200 hover:bg-[#1B171A]/90 hover:text-slate-200/90"
          >
            <PlusCircle className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
            <span className="text-xl">New Post</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Posts
