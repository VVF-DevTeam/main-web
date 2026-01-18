// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllJobs } from '@/lib/actions/job/getJob'

// Components
import JobManagement from '../../../_components/_jobs/_allJob/JobManagement'

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
    <JobManagement
      allJobs={allJobs}
      createJobLink="/registration/jobs/createJob"
      editLinkPattern="/registration/jobs/editJob/{keyName}"
      showBackButton={true}
    />
  )
}

export default AllJobs
