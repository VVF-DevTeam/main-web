// Libraries
import React from 'react'
import initTranslations from '@/app/i18n'
import { prisma } from '@/lib/db'

// Components
import JobCard from './JobCard'
import SearchBox from '@/app/[locale]/components/SearchBox'

// Interfaces & Types
interface JobListProps {
  title: string
  locale: string
}

// Main Component
const JobList = async ({ title, locale }: JobListProps) => {
  const { t } = await initTranslations(locale, ['job', 'common'])

  // Get all jobs
  const allJobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      title: {
        contains: title,
        mode: 'insensitive',
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <div>
      {/* Job Posts */}
      <div className="flex w-full flex-col items-center">
        {/* Header */}
        <div className="flex-col-center">
          <h1 className="header-sub header-font-default mb-7 text-center text-textColor-brandDark lg:text-5xl">
          {t('headerJob')}
          </h1>

          {/* Search Bar */}
          <SearchBox />
        </div>

        {/* Job Posts */}

        {allJobs.length === 0 ? (
          <p className="text-center text-xl text-muted-foreground pt-5">
            {t('noJobsOrVolunteersPosition')}
          </p>
        ) : (
          <div className="flex-col-default grid-all-cols-3 mx-auto mb-5 p-6 md:gap-y-12">
            {allJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobList
