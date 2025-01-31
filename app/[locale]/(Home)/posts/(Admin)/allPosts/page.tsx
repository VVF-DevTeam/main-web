import { prisma } from '@/lib/db'
import { DataTable } from '@/app/[locale]/(Home)/posts/(Admin)/allPosts/_components/data-table'
import { columns } from '@/app/[locale]/(Home)/posts/(Admin)/allPosts/_components/colums'
import { redirect } from 'next/navigation'
import { adminCheck } from '@/lib/utilFunctions/adminCheck'

const AllPosts = async () => {
  // check if the current user is an admin to allow access to the post control page
  if ((await adminCheck()) === false) {
    return redirect('/posts')
  }

  // Get all published and unpublished posts
  const allPosts = await prisma.post.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <div className="mx-auto my-20 flex w-full max-w-[1500px] flex-col gap-y-2 p-6">
      <h1 className="text-3xl font-semibold md:text-4xl lg:text-5xl">
        All Posts
      </h1>
      <p className="mb-12 text-sm text-muted-foreground">
        All published and unpublished posts appear here. Click on the
        <span className="font-semibold text-[#C54B3E] transition-all hover:text-[#C54B3E]/70">
          {' '}
          &quot;Edit&quot;
        </span>{' '}
        button to edit a post.
      </p>
      <DataTable columns={columns} data={allPosts} />
    </div>
  )
}

export default AllPosts
