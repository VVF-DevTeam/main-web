// Libraries
import initTranslation from '@/app/i18n'

// Components
import EventCard from './EventCard'
import EventPagination from './EventPagination'

// Interfaces & Types
import { Event, EventCategory } from '@prisma/client'

// Interfaces & Types
interface EventListProps {
  events: (Event & {
    categories: EventCategory[]
  })[]
  locale: string
  finished?: boolean
  currentPage: number
  totalPages: number
  totalItems?: number
}

// Main Component
const EventList = async ({
  events,
  locale,
  finished,
  currentPage,
  totalPages,
  totalItems,
}: EventListProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div
      className={`flex w-full flex-col items-center gap-y-6 py-10 xl:gap-y-12 xl:pt-20 ${finished ? 'bg-gray-100' : ''}`}
    >
      {finished ? (
        <h2 className="header-main text-center dark:text-textColor">{t('header-finishedEvent')}</h2>
      ) : (
        <h2 className="header-main text-center">{t('header-upcomingEvent')}</h2>
      )}
      <div className="flex-col-default grid-all-cols-3 mx-auto p-6 pb-4 md:gap-y-12">
        {events.map((event) => (
          <EventCard key={event.id} event={event} locale={locale} />
        ))}
      </div>
      <EventPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageType={finished ? 'finished' : 'upcoming'}
        showPageInfo={false}
        totalItems={totalItems}
      />
    </div>
  )
}

export default EventList
