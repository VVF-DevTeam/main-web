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

  const title = [t('Day'), t('Week'), t('Month')]
  return (
    <div className="relative p-4">
      <h1 className="mb-4 text-3xl font-bold text-textColor-brand">
        {t('event-calendar')}
      </h1>
      <ViewSelector events={JSON.parse(JSON.stringify(events))} title={title} />
    </div>
  )
}

export default EventCalendar
