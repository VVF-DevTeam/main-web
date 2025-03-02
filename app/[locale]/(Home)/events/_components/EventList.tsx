// Libraries
import initTranslation from '@/app/i18n'

// Components
import { Event } from '@prisma/client'
import EventCard from './EventCard'
import EventInstruction from './EventInstruction'
import Image from 'next/image'

// CSS & CSS Modules

// Interfaces
interface EventListProps {
  events: Event[]
  locale: string
}

// Components
const EventList = async ({ events, locale }: EventListProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])
  const eventClassName =
    'flex-col-default grid-all-cols-3 width-max-default gap-x-6 mx-auto mb-5 p-5 lg:p-12'

  return (
    <div>
      {/* Background Image and Headers */}
      <div className="flex-col-center header-font-white default-gap relative h-[70vh] p-6 text-center">
        {/* NextJS Image and Dark Overlay */}
        <div className="dark-overlay"></div>
        <Image
          src="https://drive.google.com/thumbnail?id=13ci_qVojwKNcZlAAfp5ovVMTiLAbymVj&sz=w2000"
          alt="Event List Background"
          className="next-background object-top"
          fill
          priority
        />

        {/* Titles and Descriptions */}
        <h2 className="header-main">{t('header-introduction')}</h2>
        <span className="header-text">{t('description-introduction')}</span>
      </div>

      {/* Events */}
      <div className="flex-center mt-10">
        <h1 className="header-main">{t('header-upcomingEvent')}</h1>
      </div>
      <div className={eventClassName}>
        {events.map((event) =>
          event.title !== 'Friday Chill 3' ? (
            <EventCard key={event.id} event={event} />
          ) : null
        )}
      </div>
      <EventInstruction locale={locale} />
      <div className="flex-center mt-10">
        <h1 className="header-main">{t('header-pastEvent')}</h1>
      </div>
      <div className={eventClassName}>
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
