'use client'

import React, { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Event } from '@prisma/client'
import EventCalendarDay from './EventCalendarDay'
import EventCalendarWeek from './EventCalendarWeek'
import EventCalendarMonth from './EventCalendarMonth'

const days = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

const times = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
]

interface ViewSelectorProps {
  events: Event[]
  locale: string
}

const ViewSelector = ({ events, locale }: ViewSelectorProps) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Month')
  const viewList = ['Day', 'Week', 'Month']
  return (
    <div className='w-full'>
      <div className="mb-6 flex justify-end">
        <div className="inline-flex items-center overflow-hidden rounded border text-sm">
          {viewList.map((v) => (
            <button
              key={v}
              onClick={() => setView(v as 'Day' | 'Week' | 'Month')}
              className={`border px-4 py-2 transition ${
                view === v
                  ? 'bg-bgColor-brand text-textColor-white'
                  : 'bg-bgColor-white text-textColor-gray hover:bg-bgColor-gray/20'
              }`}
            >
              {t(v)}
            </button>
          ))}
        </div>
      </div>

      {view === 'Day' && (
        <EventCalendarDay
          events={events}
          times={times}
          days={days}
          locale={locale}
        />
      )}
      {view === 'Week' && (
        <EventCalendarWeek
          events={events}
          times={times}
          days={days}
          locale={locale}
        />
      )}
      {view === 'Month' && (
        <EventCalendarMonth events={events} days={days} locale={locale} />
      )}
    </div>
  )
}

export default ViewSelector
