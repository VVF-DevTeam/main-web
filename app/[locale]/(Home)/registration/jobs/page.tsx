// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'

// Components
import HeaderAndBenefit from '../_components/_jobs/HeaderAndBenefit'
import JobAdminButtons from '../_components/_jobs/JobAdminButtons'
import JobList from '../_components/_jobs/JobList'

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
      {(await roleCheck({ role: 'ADMIN' })) ? <JobAdminButtons /> : null}
    </div>
  )
}

export default JobsAndVolunteers
