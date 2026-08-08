// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import { getJobForEditing } from '@/lib/actions/job/getJob'

// Components
import EditJob from '@/app/[locale]/(Home)/registration/_components/_jobs/_editJob/EditJob'
import NotFound from '@/app/[locale]/(Home)/not-found'

const EditJobPage = async ({
  params,
}: {
  params: Promise<{ jobKeyName: string; locale: string }>
}) => {
  const isSuperAdmin = await roleCheck({ role: 'SUPERADMIN' })

  // check if the current user is an admin to allow access to the job control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' })) &&
    !isSuperAdmin
  ) {
    return redirect('/registration/jobs')
  }

  const { jobKeyName } = await params

  // Get current user info
  const user = await getCurrentUserInfo()
  if (!user) {
    return redirect('/signIn')
  }

  // Fetch the Job data
  const job = await getJobForEditing(jobKeyName)

  if (!job) {
    return <NotFound />
  }

  return (
    <EditJob
      job={job}
      isSuperAdmin={Boolean(isSuperAdmin)}
      showBackButton={true}
    />
  )
}

export default EditJobPage
