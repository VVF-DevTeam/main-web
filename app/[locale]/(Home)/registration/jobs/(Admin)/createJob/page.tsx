// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

// Components
import CreateJobForm from '../../../_components/_jobs/_createJob/CreateJobForm'

// Main Component
const CreateEventPage = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (!(await roleCheck({ role: 'ADMIN' })) && !(await roleCheck({ role: 'HOST' }))) {
    return redirect('/events')
  }

  // Get the current user's id 
  const session = await auth()

  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateJobForm author={session?.user?.id!} />
    </div>
  )
}

export default CreateEventPage
