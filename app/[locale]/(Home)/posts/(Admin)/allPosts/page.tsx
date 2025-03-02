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
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      <h1 className="header-sub">All Posts</h1>
      <p className="text-muted-foreground mb-12 text-sm">
        All published and unpublished posts appear here. Click on the
        <span className="hover:text-textColor-brand/70 font-semibold text-textColor-brand transition-all">
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
