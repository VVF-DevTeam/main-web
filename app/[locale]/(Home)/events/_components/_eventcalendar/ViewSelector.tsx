'use client'

import React, { useState } from 'react'
import { Event } from '@prisma/client'
import EventCalendarDay from './EventCalendarDay'
import EventCalendarWeek from './EventCalendarWeek'
import EventCalendarMonth from './EventCalendarMonth'

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const times = Array.from({ length: 13 }, (_, i) => {
  const hour = 9 + i
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour
  return `${displayHour}:00 ${suffix}`
})

interface ViewSelectorProps {
  events: Event[]
  title: string[]
}

const ViewSelector = ({ events, title }: ViewSelectorProps) => {
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Week')

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <div className="inline-flex items-center overflow-hidden rounded border text-sm">
          {title.map((v) => (
            <button
              key={v}
              onClick={() => setView(v as 'Day' | 'Week' | 'Month')}
              className={`border px-4 py-2 transition ${
                view === v
                  ? 'bg-bgColor-brand text-textColor-white'
                  : 'bg-bgColor-white text-textColor-gray hover:bg-bgColor-gray/20'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'Day' && <EventCalendarDay events={events} times={times} />}
      {view === 'Week' && (
        <EventCalendarWeek events={events} times={times} days={days} />
      )}
      {view === 'Month' && <EventCalendarMonth events={events} days={days} />}
    </div>
  )
}

export default ViewSelector
