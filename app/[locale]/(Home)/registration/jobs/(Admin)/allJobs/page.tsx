// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllJobs } from '@/lib/actions/job/getJob'

// Components
import BackButton from '@/components/ui/back-button'
import { DataTable } from '../../../_components/_jobs/_allJob/data-table'
import { columns } from '../../../_components/_jobs/_allJob/columns'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const AllJobs = async () => {
  // check if the current user is an admin to allow access to the job control page
  if (!(await roleCheck({ role: 'ADMIN' })) && !(await roleCheck({ role: 'HOST' }))) {
    return redirect('registration/jobs')
  }

  // Get all published and unpublished jobs
  const allJobs = await getAllJobs()
  
  return (
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />

      {/* Jobs Table */}
      <h1 className="header-sub">All Jobs</h1>
      <p className="mb-12 text-sm text-muted-foreground">
        All published and unpublished jobs appear here. Click on the
        <span className="font-semibold text-textColor-brand900 transition-all hover:text-textColor-brand/70">
          {' '}
          &quot;Edit&quot;
        </span>{' '}
        button to edit a job.
      </p>
      <DataTable columns={columns} data={allJobs} />
    </div>
  )
}

export default AllJobs
