'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EventType as PrismaEventType } from '@prisma/client'

interface EventButtonProps {
  eventId: string
  eventType: keyof typeof PrismaEventType
}
const EventButton = ({ eventId, eventType }: EventButtonProps) => {
  console.log(eventType)
  const eventUrl =
    eventType === 'CONCERT'
      ? `/events/concert/${eventId}`
      : `/events/class/${eventId}`

  return (
    <Link href={eventUrl}>
      <Button
        size={'sm'}
        className="all ease text-pretty border-2 border-sky-600 bg-slate-100 text-sm font-bold text-sky-600 transition hover:bg-sky-600/70 hover:text-slate-50"
      >
        Read more
      </Button>
    </Link>
  )
}

export default EventButton
