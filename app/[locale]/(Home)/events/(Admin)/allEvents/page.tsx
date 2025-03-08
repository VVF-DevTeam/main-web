// Libraries
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { adminCheck } from '@/lib/dbQueries/adminCheck'

// Components
import BackButton from '@/components/ui/back-button'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'

// Main Component
const AllPosts = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (!(await adminCheck())) {
    return redirect('/posts')
  }

  // Get all published and unpublished posts
  const allEvents = await prisma.event.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  })
  console.log(allEvents)
  
  return (
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />

      {/* Posts Table */}
      <h1 className="header-sub">All Events</h1>
      <p className="mb-12 text-sm text-muted-foreground">
        All published and unpublished events appear here. Click on the
        <span className="font-semibold text-textColor-brand transition-all hover:text-textColor-brand/70">
          {' '}
          &quot;Edit&quot;
        </span>{' '}
        button to edit a post.
      </p>
      <DataTable columns={columns} data={allEvents} />
    </div>
  )
}

export default AllPosts
