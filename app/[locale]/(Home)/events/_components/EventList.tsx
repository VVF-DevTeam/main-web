import { Event } from '@prisma/client'
import EventCard from './EventCard'
import EventInstruction from './EventInstruction'
import initTranslation from '@/app/i18n'

interface EventListProps {
  events: Event[]
  locale: string
}

const EventList = async ({ events, locale }: EventListProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div>
      <div className="flex h-[70vh] flex-col items-center justify-center gap-y-4 bg-[#3a3635] bg-[url(/bg/tennis-team-bg.jpg)] bg-cover bg-no-repeat p-6 bg-blend-overlay">
        <h2 className="text-center text-5xl font-bold uppercase text-white">
          {t('header-introduction')}
        </h2>
        <span className="max-w-[60vw] text-center text-xl text-white">
        {t('description-introduction')}
        </span>
      </div>

      <div className="mt-10 flex items-center justify-center gap-4 py-2 text-3xl md:text-4xl lg:mt-20 lg:text-5xl">
        <h1>{t('header-upcomingEvent')}</h1>
      </div>
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 p-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:p-12 mb-5">
        {events.map((event) =>
          event.title !== 'Friday Chill 3' ? (
            <EventCard key={event.id} event={event} />
          ) : null
        )}
      </div>
      <EventInstruction locale={locale} />

      <div className="mt-10 flex items-center justify-center gap-4 py-2 text-3xl md:text-4xl lg:mt-20 lg:text-5xl">
        <h1>{t('header-pastEvent')}</h1>
      </div>
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 p-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:p-12">
        {events.map((event) =>
          event.title === 'Friday Chill 3' ? (
            <EventCard key={event.id} event={event} />
          ) : null
        )}
      </div>

    </div>
  )
}

export default EventList
