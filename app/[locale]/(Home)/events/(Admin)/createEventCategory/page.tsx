// Libraries
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'

// Components
import CategoryManager from '../_components/CategoryManager'
import BackButton from '@/components/ui/back-button'

// Main Component
const createEventCategoryPage = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (!(await roleCheck({ role: 'ADMIN' })) && !(await roleCheck({ role: 'HOST' }))) {
    return redirect('/events')
  }

  // Get all event tags
  const eventTags = await prisma.eventCategory.findMany()
  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />
      
      <CategoryManager eventTags={eventTags} />
    </div>
  )
}

export default createEventCategoryPage
