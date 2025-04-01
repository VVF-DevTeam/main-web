'use client'

import React, { useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { Event } from '@prisma/client'

interface EventCalendarProps {
  events: Event[]
  times: string[]
}

const EventCalendarDay = ({ events, times }: EventCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const dayText = format(currentDate, 'EEEE')
  const SLOT_HEIGHT_REM = 6

  const handlePrev = () => setCurrentDate(subDays(currentDate, 1))
  const handleNext = () => setCurrentDate(addDays(currentDate, 1))

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex items-center gap-4 text-xl font-semibold">
        <button aria-label="previous-month" onClick={handlePrev}>
          <ArrowLeft className="h-5 w-5 cursor-pointer hover:text-textColor-brand" />
        </button>
        <button aria-label="next-month" onClick={handleNext}>
          <ArrowRight className="h-5 w-5 cursor-pointer hover:text-textColor-brand" />
        </button>
        <span className="ml-2">{format(currentDate, 'MMMM d, yyyy')}</span>
      </div>

      <div className="bg-bgColor-white relative grid min-w-full grid-cols-[100px_1fr]">
        <div className="border-r py-3 text-center font-bold">Time</div>
        <div className="py-3 text-center font-bold">
          {dayText} <br /> {format(currentDate, 'd')}
        </div>

        {times.map((time, rowIdx) => (
          <React.Fragment key={`time-row-${rowIdx}`}>
            <div className="flex h-24 items-center border-r border-t p-2 text-right text-sm">
              {time}
            </div>
            <div className="relative h-24 border-l border-t">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-bgColor-gray/20" />
            </div>
          </React.Fragment>
        ))}

        <div className="absolute bottom-0 left-[100px] right-0 top-[4.5rem]">
          {events.map((event) => {
            const start = event.startDate ? new Date(event.startDate) : null
            const end = event.endDate ? new Date(event.endDate) : null
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
                className="absolute left-2 right-2 z-10 cursor-pointer rounded bg-bgColor-brand p-2 text-xs text-textColor-white shadow-md hover:bg-bgColor-brandLight"
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
      </div>
    </div>
  )
}

export default EventCalendarDay
