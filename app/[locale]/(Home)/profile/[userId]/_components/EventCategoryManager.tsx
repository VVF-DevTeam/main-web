// Libraries
import { EventCategory } from '@prisma/client'
import { getAllEventCategories } from '@/lib/actions/event/getEventCategories'

// Components
import CategoryManager from '@/app/[locale]/(Home)/events/(Admin)/_components/CategoryManager'

interface EventCategoryManagerProps {
  user: {
    role: string[]
  }
}

export default async function EventCategoryManager({
  user,
}: EventCategoryManagerProps) {
  // Get all event tags using cached function
  let eventTags: EventCategory[] = []
  try {
    eventTags = await getAllEventCategories()
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="mx-auto my-20 max-w-5xl bg-slate-50 p-6">
      <CategoryManager eventTags={eventTags} />
    </div>
  )
}

