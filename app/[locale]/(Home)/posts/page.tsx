import PostList from './_components/PostList'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
const Posts = async () => {
  // TODO: Abstract this code to a db function.
  const session = await auth()
  const publishedPosts = await prisma.post.findMany({
    where: {
      isPublished: true,
    },
    include: {
      postLikes: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <div className="my-20 flex w-full max-w-[1500px] mx-auto flex-col p-6">
      {/* Header */}
      <div className="flex w-full flex-col gap-y-2">
        <h1 className="text-3xl font-semibold md:text-4xl lg:text-5xl">
          News Feed
        </h1>
        <p className="mb-12 text-sm text-muted-foreground">
          Stay up to date with the latest news from Viet Vibe
        </p>
      </div>

      {/* Posts */}
      {publishedPosts.length > 0 ? (
        <PostList posts={publishedPosts} userId={session?.user?.id || null} />
      ) : (
        <p className="flex items-center justify-center text-2xl font-semibold">
          No posts to show.
        </p>
      )}
      {/* TODO: Add button to create a new post only for admins */}
      <div className="mt-6 flex w-full items-center justify-end gap-x-4 px-6">
        <Link href="/posts/allPosts" className="group mb-2 py-6">
          <Button
            variant={'ghost'}
            className="flex items-center gap-x-2 bg-slate-200 p-6 text-black hover:bg-slate-300/90 hover:text-black/90"
          >
            <ArrowRight className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
            <span className="text-xl">All Posts</span>
          </Button>
        </Link>

        <Link href="/posts/createNewPost" className="group mb-2 py-6">
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
