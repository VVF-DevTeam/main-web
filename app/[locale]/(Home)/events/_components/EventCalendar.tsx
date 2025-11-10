'use server'

// Libraries
import initTranslation from '@/app/i18n'

// Components
import ViewSelector from './_eventcalendar/ViewSelector'
//Interfaces

import { Event } from '@prisma/client'

interface EventCalendarProps {
  events: Event[]
  locale: string
}

const EventCalendar = async ({ events, locale }: EventCalendarProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="my-10 flex w-full flex-col items-center gap-y-5 xl:mt-14 xl:gap-y-6 pb-5">
      <h2 className="web_h1 text-center">
        {t('event-calendar')}
      </h2>
      <ViewSelector
        events={JSON.parse(JSON.stringify(events))}
        locale={locale}
      />
    </div>
  )
}

export default EventCalendar
