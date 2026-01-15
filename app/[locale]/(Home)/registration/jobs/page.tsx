// Components
import HeaderAndBenefit from '../_components/_jobs/HeaderAndBenefit'
import JobAdminButtons from '../_components/_jobs/JobAdminButtons'
import JobList from '../_components/_jobs/JobList'

// Note: Pages with searchParams are dynamic and cannot be edge-cached by Vercel
export const dynamic = 'force-dynamic'

// Main Component
const JobsAndVolunteers = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    title?: string
    eventKeyName?: string
  }>
}) => {
  const { locale } = await params
  const { title, eventKeyName } = await searchParams

  return (
    <div className="flex flex-col gap-y-6 p-4 text-base md:text-lg">
      <HeaderAndBenefit locale={locale} />
      <JobList title={title} eventKeyName={eventKeyName} locale={locale} />
      <JobAdminButtons />
    </div>
  )
}

export default JobsAndVolunteers
