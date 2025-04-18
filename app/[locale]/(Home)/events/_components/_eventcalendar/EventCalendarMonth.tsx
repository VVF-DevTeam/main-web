'use client'

import React, { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
} from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'

import { useTranslation } from 'react-i18next'

import { Event } from '@prisma/client'

interface EventCalendarMonthProps {
  events: Event[]
  days: string[]
  locale: string
}

const EventCalendarMonth = ({
  events,
  days,
  locale,
}: EventCalendarMonthProps) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')

  const [currentDate, setCurrentDate] = useState(new Date())

  const handlePrev = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNext = () => setCurrentDate(addMonths(currentDate, 1))

  const start = startOfWeek(startOfMonth(currentDate))
  const end = endOfWeek(endOfMonth(currentDate))
  const daysInMonthGrid = eachDayOfInterval({ start, end })
  const today = new Date()

  const formattedMonth = new Intl.DateTimeFormat(locale, {
    month: 'long',
  }).format(currentDate)

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
        <span className="ml-2">
          {formattedMonth + format(currentDate, ' yyyy')}
        </span>
      </div>

      <div className="bg-bgColor-white grid min-w-[700px] grid-cols-7 border">
        {days.map((day) => (
          <div key={day} className="border py-2 text-center font-semibold">
            {t(day)}
          </div>
        ))}

        {daysInMonthGrid.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const isToday = isSameDay(date, today)
          const dayText = format(date, 'EEEE')

          const dailyEvents = events.filter((e) => {
            const start = e.startDate ? new Date(e.startDate) : null
            const end = e.endDate ? new Date(e.endDate) : null
            return (
              start &&
              end &&
              date >= start &&
              date <= end &&
              e.days?.includes(dayText.toUpperCase())
            )
          })

          return (
            <div
              key={idx}
              className={`min-h-[120px] border p-2 text-sm ${
                isCurrentMonth
                  ? 'bg-bgColor-white'
                  : 'text-textColor-grayLight bg-bgColor-grayLight'
              }`}
            >
              <div
                className={`mx-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isToday ? 'bg-bgColor-brand text-textColor-white' : ''
                }`}
              >
                {format(date, 'd')}
              </div>

              <div className="mt-1 space-y-1">
                {dailyEvents.map((event) => {
                  const eventUrl =
                    event.eventType === 'CONCERT'
                      ? `/events/concert/${event.keyName}`
                      : `/events/class/${event.keyName}`

                  return (
                    <Link
                      key={event.id}
                      href={eventUrl}
                      className="block rounded bg-bgColor-brand px-2 py-1 text-xs text-textColor-white shadow-sm hover:bg-bgColor-brandLight"
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EventCalendarMonth
