// Libraries
import initTranslation from '@/app/i18n'

// Components
import EventCard from './EventCard'

// Interfaces & Types
import { Event } from '@prisma/client'

// Interfaces & Types
interface EventListProps {
  events: Event[]
  locale: string
}

// Main Component
const EventList = async ({ events, locale }: EventListProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="flex w-full flex-col items-center gap-y-6 xl:gap-y-12 my-10 xl:mt-20">
      <h2 className="header-main text-center">
        {t('header-upcomingEvent')}
      </h2>
      <div className="mx-auto mb-5 flex-col-default grid-all-cols-3 p-6 md:gap-y-12">
        {events.map((event) =>
          <EventCard key={event.id} event={event} locale={locale} />
        )}
      </div>
    </div>
  )
}

export default EventList
