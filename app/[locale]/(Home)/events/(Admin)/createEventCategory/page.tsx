// Libraries
import { prisma } from '@/lib/db'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'

// Components
import { Separator } from '@/components/ui/separator'
import NewCategory from '../_components/NewCategory'
import PreviewBadge from '../_components/PreviewBadge'
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
      
      {/* Section 1 */}
      <div className="flex flex-col gap-y-12 rounded-xl bg-slate-200 p-6">
        <h1 className="text-center text-2xl font-semibold md:text-3xl lg:text-4xl">
          All Event Tags
        </h1>

        {eventTags.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No tags to show. All event tags would appear here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {eventTags.map((tag) => (
              <PreviewBadge
                key={tag.id}
                title={tag.title}
                isItalic={tag.isItalic}
                isBold={tag.isBold}
                bgColor={tag.bgColor}
                textColor={tag.textColor}
                helperText={null}
              />
            ))}
          </div>
        )}
      </div>

      <Separator className="mx-auto mb-[5vh] mt-[5vh] w-[70%] bg-red-700" />

      {/* Section 2 */}
      <div className="flex flex-col gap-y-20 rounded-xl bg-slate-200 p-6">
        <h1 className="text-center text-2xl font-semibold md:text-3xl lg:text-4xl">
          Create New Event Tag
        </h1>
        <NewCategory />
      </div>
    </div>
  )
}

export default createEventCategoryPage
