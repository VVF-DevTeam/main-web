// Libraries
import React from 'react'
import initTranslations from '@/app/i18n'
import { getAllPublishedEvents } from '@/lib/actions/event/getEvent'
import { getPublishedJobs } from '@/lib/actions/job/getJob'

// Components
import JobCard from './JobCard'
import SearchAndFilter from '@/components/searchAndFilter/SearchAndFilter'

// Interfaces & Types
interface JobListProps {
  title?: string
  eventKeyName?: string
  locale: string
}

interface Event {
  title: string
  keyName: string
}

// Main Component
const JobList = async ({ title, eventKeyName, locale }: JobListProps) => {
  const { t } = await initTranslations(locale, ['job', 'common'])
  let allJobs: Awaited<ReturnType<typeof getPublishedJobs>> = []
  let allEvents: Event[] = []

  // Get all published events for filter dropdown using cached function
  try {
    allEvents = await getAllPublishedEvents({
      title: true,
      keyName: true,
    })
  } catch (error) {
    console.error('Error fetching events:', error)
  }

  // Get published jobs with filters using cached function
  try {
    allJobs = await getPublishedJobs({
      title: title || undefined,
      eventKeyName: eventKeyName || undefined,
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
  }

  return (
    <div>
      {/* Job Posts */}
      <div className="flex w-full flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-2">
          <h1 className="header-sub header-font-default mb-2 text-center text-textColor-brandDark900 lg:text-5xl">
            {t('headerJob')}
          </h1>
        </div>

        {/* Search and Filter */}
        <div className="w-full max-w-6xl px-6 mb-8">
          <SearchAndFilter
            searchLabel={t('search-jobs') || 'Search Jobs'}
            searchPlaceholder={t('search-placeholder') || 'Search by job title...'}
            searchUrlParam="title"
            initialSearchTerm={title || ''}
            initialFilterValues={{
              event: eventKeyName || 'all',
            }}
            filters={[
              {
                id: 'event',
                label: t('filter-by-event') || 'Filter by Event',
                placeholder: t('all-events') || 'All Events',
                urlParam: 'eventKeyName',
                options: allEvents.map(event => ({
                  value: event.keyName,
                  label: event.title,
                })),
                searchable: true,
                searchPlaceholder: t('search-event') || 'Search for event...',
              },
            ]}
            clearButtonLabel={t('clear-filter') || 'Clear Filter'}
          />
        </div>

        {/* Job Posts */}
        {allJobs.length === 0 ? (
          <p className="pt-5 text-center text-xl text-muted-foreground">
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
