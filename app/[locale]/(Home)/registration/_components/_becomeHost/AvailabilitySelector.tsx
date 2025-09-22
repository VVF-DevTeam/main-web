'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// Utilities
import { createTimeRanges } from '@/lib/utilFunctions/timeUtils'

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

function AvailabilitySelector({
  value,
  onChange,
  locale,
}: {
  value: Record<string, string[]>
  onChange: (v: Record<string, string[]>) => void
  locale: string
}) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation(['host', 'event'])

  const baseWeekStart = startOfWeek(addWeeks(new Date(), 1))
  const maxDate = addWeeks(baseWeekStart, 1) // One week from week start
  const [currentDate, setCurrentDate] = useState(baseWeekStart)

  const handlePrev = () => {
    const newDate = subWeeks(currentDate, 1)

    const newWeekStart = startOfWeek(newDate)
    // Only allow going back if the new week starts on or after today
    if (newWeekStart >= baseWeekStart) {
      setCurrentDate(newDate)
    }
  }

  const handleNext = () => {
    const newDate = addWeeks(currentDate, 1)
    const newWeekStart = startOfWeek(newDate)
    // Only allow going forward if the new week starts within 2 weeks
    if (newWeekStart <= maxDate) {
      setCurrentDate(newDate)
    }
  }

  const weekStart = startOfWeek(currentDate)
  const canGoPrev = startOfWeek(subWeeks(currentDate, 1)) >= baseWeekStart
  const canGoNext = startOfWeek(addWeeks(currentDate, 1)) <= maxDate

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

  const toggle = (dayIndex: number, time: string) => {
    const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd')
    const prev = value[date] ?? []
    const next = prev.includes(time)
      ? prev.filter((t) => t !== time)
      : [...prev, time]
    onChange({ ...value, [date]: next })
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-xs text-textColor-gray sm:text-sm">
        {t('host-availability-header')}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            canGoPrev
              ? 'border-gray-300 text-textColor-gray hover:bg-bgColor-grayLight/50'
              : 'cursor-not-allowed border-gray-200 text-textColor-gray/50'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('host-availability-prev')}
        </button>

        <div className="text-textColor-black text-lg font-semibold">
          {weekDisplay}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
            canGoNext
              ? 'border-gray-300 text-textColor-gray hover:bg-bgColor-grayLight/50'
              : 'cursor-not-allowed border-gray-200 text-textColor-gray/50'
          }`}
        >
          {t('host-availability-next')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="bg-bgColor-white relative grid min-w-[800px] grid-cols-[100px_repeat(7,_1fr)] rounded-lg border border-gray-300">
          {/* Header Row */}
          <div className="text-textColor-black border-r bg-bgColor-grayLight py-3 text-center text-sm font-bold">
            {t('time', { ns: 'event' })}
          </div>
          {days.map((day, idx) => (
            <div
              key={day}
              className="text-textColor-black border-l bg-bgColor-grayLight py-3 text-center text-sm font-bold"
            >
              <div>{t(day, { ns: 'event' })}</div>
              <div className="text-xs text-textColor-gray">
                {format(addDays(weekStart, idx), 'd')}
              </div>
            </div>
          ))}

          {/* Time rows */}
          {times.map((time, rowIdx) => (
            <React.Fragment key={`time-row-${rowIdx}`}>
              <div className="flex h-12 items-center border-r border-t p-2 text-right text-sm text-textColor-gray">
                {time}
              </div>
              {days.map((day, colIdx) => {
                const date = format(addDays(weekStart, colIdx), 'yyyy-MM-dd')
                const isSelected = (value[date] ?? []).includes(time)
                return (
                  <div
                    key={`cell-${rowIdx}-${colIdx}`}
                    className="relative h-12 cursor-pointer border-l border-t transition-colors hover:bg-bgColor-grayLight/50"
                    onClick={() => toggle(colIdx, time)}
                  >
                    {isSelected && (
                      <div className="absolute inset-2 rounded-md bg-bgColor-brand shadow-sm" />
                    )}
                    {/* Visual feedback for selection */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-textColor-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Selected Availability Summary */}
      {Object.keys(value).length > 0 && (
        <div className="mt-6 rounded-lg bg-bgColor-grayLight/30 p-4">
          <h3 className="text-textColor-black mb-3 text-sm font-semibold">
            {t('host-availability-summary')}
          </h3>
          <div className="space-y-2">
            {Object.entries(value)
              .filter(([, slots]) => slots.length > 0)
              .map(([dateStr, slots]) => {
                const ranges = createTimeRanges(slots)
                const date = new Date(dateStr)
                const dayName = new Intl.DateTimeFormat(locale, {
                  weekday: 'long',
                }).format(date)
                const formattedDate = format(date, 'MM-dd-yyyy')
                return (
                  <div key={dateStr} className="text-sm text-textColor-gray">
                    <span className="text-textColor-black font-medium capitalize">
                      {t(dayName)} ({formattedDate}):
                    </span>{' '}
                    {ranges.join(', ')}
                  </div>
                )
              })}
            {Object.values(value).every((slots) => slots.length === 0) && (
              <p className="text-sm italic text-textColor-gray">
                {t('host-availability-summary-empty')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AvailabilitySelector
