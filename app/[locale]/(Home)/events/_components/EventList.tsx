import { Event } from '@prisma/client'
import EventCard from './EventCard'
import EventInstruction from './EventInstruction'
import initTranslation from '@/app/i18n'
import Image from 'next/image'
import headerMainStyles from '@/lib/ui/cssModules/headers/headerMain.module.css'

interface EventListProps {
  events: Event[]
  locale: string
}

const EventList = async ({ events, locale }: EventListProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div>
      <div
        className={`${headerMainStyles.introFont} flexColCenter relative h-[70vh] gap-y-4 p-6`}
      >
        {/* NextJS Image and Dark Overlay */}
        <div className={`darkOverlay`}></div>
        <Image
          src="https://drive.google.com/thumbnail?id=13ci_qVojwKNcZlAAfp5ovVMTiLAbymVj&sz=w2000"
          alt="Intro"
          className={`nextBG object-top`}
          fill
          priority
        />

        {/* Titles and Descriptions */}
        <h2 className={`${headerMainStyles.big}`}>
          {t('header-introduction')}
        </h2>
        <span className={`${headerMainStyles.small}`}>
          {t('description-introduction')}
        </span>
      </div>
      <div className="mt-10 flex items-center justify-center gap-4 py-2 text-3xl md:text-4xl lg:mt-20 lg:text-5xl">
        <h1>{t('header-upcomingEvent')}</h1>
      </div>
      <div className="mx-auto mb-5 grid max-w-[1500px] grid-cols-1 gap-6 p-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:p-12">
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
