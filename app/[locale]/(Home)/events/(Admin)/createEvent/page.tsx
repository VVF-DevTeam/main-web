// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'

// Components
import CreateEventForm from '../_components/CreateEvent'

// Main Component
const CreateEventPage = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (!(await roleCheck({ role: 'ADMIN' })) && !(await roleCheck({ role: 'HOST' }))) {
    return redirect('/events')
  }

  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateEventForm author="admin" />
    </div>
  )
}

export default CreateEventPage
