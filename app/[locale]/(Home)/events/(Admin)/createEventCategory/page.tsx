// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'
import { getAllEventCategories } from '@/lib/actions/event/getEventCategories'

// Components
import CategoryManager from '../_components/CategoryManager'
import BackButton from '@/components/ui/back-button'
import { EventCategory } from '@prisma/client'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const createEventCategoryPage = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' })) &&
    !(await roleCheck({ role: 'SUPERADMIN' }))
  ) {
    return redirect('/events')
  }

  // Get all event tags using cached function
  let eventTags: EventCategory[] = []
  try {
    eventTags = await getAllEventCategories()
  } catch (error) {
    console.error(error)
  }
  
  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      {/* Back Button To Parent Page */}
      <BackButton />

      <CategoryManager eventTags={eventTags} />
    </div>
  )
}

export default createEventCategoryPage
