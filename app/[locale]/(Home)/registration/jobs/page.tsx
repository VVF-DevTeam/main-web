// Libraries
import { roleCheck } from '@/lib/dbQueries/roleCheck'
import { prisma } from '@/lib/db'
import initTranslations from '@/app/i18n'

// Components
import HeaderAndBenefit from '../_components/_jobs/HeaderAndBenefit'
import JobAdminButtons from '../_components/_jobs/JobAdminButtons'
import JobList from '../_components/_jobs/JobList'

const JobsAndVolunteers = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  const { t } = await initTranslations(locale, ['job', 'common'])

  // Get all jobs
  const allJobs = await prisma.job.findMany({
    where: {
      isPublished: true,
    },
  })
  if (allJobs.length === 0) {
    return (
      <p className="text-center text-xl text-muted-foreground">
        {t('noJobsOrVolunteersPosition')}
      </p>
    )
  }

  return (
    <div className='flex flex-col gap-y-6 p-4 text-base md:text-lg'>
      <HeaderAndBenefit />
      <JobList jobs = {allJobs} />
      {(await roleCheck({ role: 'ADMIN' })) ? <JobAdminButtons /> : null}
    </div>
  )
}

export default JobsAndVolunteers
