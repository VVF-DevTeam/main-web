'use client'
import React, { useState } from 'react'
import { Event, EventSchedule } from '@prisma/client'
import { Pencil } from 'lucide-react'
import ScheduleItem from '@/app/[locale]/(Home)/events/_components/ScheduleItem'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EventSheduleListProps {
  event: Event & { schedules: EventSchedule[] }
}

const EventScheduleList = ({ event }: EventSheduleListProps) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event Schedule</h3>
        <Button
          variant={null}
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            isEditing
              ? 'font-semibold text-gray-700 transition-all duration-75 hover:text-red-700'
              : 'font-semibold text-red-700 transition-all duration-75 hover:text-gray-700'
          )}
        >
          {isEditing ? (
            'Cancel'
          ) : (
            <span className="flex gap-x-2">
              Edit <Pencil className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>

      {/* FORM */}
      <div>
        {isEditing ? (
          <div className="flex flex-col gap-y-4">
            {event.schedules.length === 0 ? (
              <ScheduleItem
                eventId={event.id}
                scheduleItemId={null}
                startTime={event.startTime || '00:00'}
                endTime={event.endTime || '00:00'}
                description=""
                position={null}
                isEditable={true}
              />
            ) : (
              event.schedules.map((schedule) => (
                <ScheduleItem
                  eventId={event.id}
                  scheduleItemId={schedule.id}
                  key={schedule.id}
                  startTime={schedule.startTime || event.startTime || '00:00'}
                  endTime={schedule.endTime || event.endTime || '19:00'}
                  description={schedule.description || ''}
                  position={schedule.position}
                  isEditable={true}
                />
              ))
            )}
          </div>
        ) : event.schedules.length === 0 ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add event schedule.
          </p>
        ) : (
          <div className="flex flex-col gap-y-4 text-muted-foreground">
            {event.schedules.map((schedule) => (
              <ScheduleItem
                eventId={event.id}
                scheduleItemId={schedule.id}
                key={schedule.id}
                startTime={schedule.startTime || event.startTime || '00:00'}
                endTime={schedule.endTime || event.endTime || '19:00'}
                description={schedule.description || ''}
                position={schedule.position}
                isEditable={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventScheduleList
