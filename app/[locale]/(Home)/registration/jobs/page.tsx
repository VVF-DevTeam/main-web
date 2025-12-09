// Components
import HeaderAndBenefit from '../_components/_jobs/HeaderAndBenefit'
import JobAdminButtons from '../_components/_jobs/JobAdminButtons'
import JobList from '../_components/_jobs/JobList'

// Enable ISR - revalidate every hour
export const revalidate = 3600
export const dynamic = 'force-static'

// Main Component
const JobsAndVolunteers = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    title: string
  }>
}) => {
  const { locale } = await params
  const { title } = await searchParams

  return (
    <div className="flex flex-col gap-y-6 p-4 text-base md:text-lg">
      <HeaderAndBenefit locale={locale} />
      <JobList title={title} locale={locale} />
      <JobAdminButtons />
    </div>
  )
}

export default JobsAndVolunteers
