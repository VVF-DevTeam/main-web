'use client'

import React, { useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'

import { useTranslation } from 'react-i18next'

import { Event } from '@prisma/client'

interface EventCalendarWeekProps {
  events: Event[]
  times: string[]
  days: string[]
  locale: string
}

const EventCalendarWeek = ({
  events,
  days,
  times,
  locale,
}: EventCalendarWeekProps) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')
  const [currentDate, setCurrentDate] = useState(new Date())

  const handlePrev = () => setCurrentDate(subWeeks(currentDate, 1))
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 1))

  const SLOT_HEIGHT_REM = 6

  const weekStart = startOfWeek(currentDate)

  const startMonth = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    weekStart
  )
  const endMonth = new Intl.DateTimeFormat(locale, { month: 'long' }).format(
    addDays(weekStart, 6)
  )
  const startYear = format(weekStart, 'yyyy')
  const endYear = format(addDays(weekStart, 6), 'yyyy')

  let weekDisplay = ''
  if (startYear === endYear) {
    weekDisplay =
      startMonth === endMonth
        ? `${startMonth} ${startYear}`
        : `${startMonth} – ${endMonth}, ${startYear}`
  } else {
    weekDisplay = `${startMonth} ${startYear} – ${endMonth} ${endYear}`
  }

  return (
    <div className="overflow-x-auto">
      {/* Header Navigation */}
      <div className="mb-4 flex items-center gap-4 text-xl font-semibold">
        <button aria-label="previous-month" onClick={handlePrev}>
          <ArrowLeft className="h-5 w-5 cursor-pointer hover:text-textColor-brand" />
        </button>
        <button aria-label="next-month" onClick={handleNext}>
          <ArrowRight className="h-5 w-5 cursor-pointer hover:text-textColor-brand" />
        </button>
        <span className="ml-2">{weekDisplay}</span>
      </div>
      <div className="bg-bgColor-white relative grid min-w-[700px] grid-cols-[100px_repeat(7,_1fr)]">
        {/* Header Row */}
        <div className="bg-bgColor-white border-r py-3 text-center font-bold">
          {t('time')}
        </div>
        {days.map((day, idx) => (
          <div
            key={day}
            className="bg-bgColor-white border-l py-3 text-center font-bold"
          >
            {t(day)} <br /> {format(addDays(weekStart, idx), 'd')}
          </div>
        ))}

        {/* Time rows */}
        {times.map((time, rowIdx) => (
          <React.Fragment key={`time-row-${rowIdx}`}>
            <div className="flex h-24 items-center border-r border-t p-2 text-right text-sm">
              {time}
            </div>
            {days.map((_, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="relative h-24 border-l border-t"
              >
                {/* half-hour divider line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-bgColor-gray/10" />
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* Event layer */}
        <div className="absolute bottom-0 left-[100px] right-0 top-[4.5rem] grid grid-cols-7">
          {days.map((day, idx) => (
            <div key={day} className="relative">
              {events.map((event) => {
                const start = event.startDate ? new Date(event.startDate) : null
                const end = event.endDate ? new Date(event.endDate) : null
                const dayText = format(addDays(weekStart, idx), 'EEEE')
                if (
                  !start ||
                  !end ||
                  currentDate < start ||
                  currentDate > end ||
                  !event.days?.includes(dayText.toUpperCase()) ||
                  !event.startTime ||
                  !event.endTime
                )
                  return null

                const [startH, startM] = event.startTime.split(':').map(Number)
                const [endH, endM] = event.endTime.split(':').map(Number)
                const startDecimal = startH + startM / 60
                const endDecimal = endH + endM / 60
                const top = (startDecimal - 9) * SLOT_HEIGHT_REM
                const height = (endDecimal - startDecimal) * SLOT_HEIGHT_REM
                const eventUrl =
                  event.eventType === 'CONCERT'
                    ? `/events/concert/${event.keyName}`
                    : `/events/class/${event.keyName}`

                return (
                  <Link
                    key={event.id}
                    href={eventUrl}
                    className="absolute left-1 right-1 z-10 cursor-pointer rounded bg-bgColor-brand p-2 text-xs text-textColor-white shadow-md hover:bg-bgColor-brandLight overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent hover:scrollbar-thumb-gray-400"
                    style={{ top: `${top}rem`, height: `${height}rem` }}
                  >
                    <strong>{event.title}</strong>
                    <div className="mt-1 flex items-center gap-x-2 text-xs">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventCalendarWeek
