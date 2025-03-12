'use client'
//  Libraries
import React from 'react'

// Components
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Interfaces & Types
import { EventType as PrismaEventType } from '@prisma/client'

interface EventButtonProps {
  eventKeyName: string
  eventType: keyof typeof PrismaEventType
}

// Component
const EventButton = ({ eventKeyName, eventType }: EventButtonProps) => {

  const eventUrl =
    eventType === 'CONCERT'
      ? `/events/concert/${eventKeyName}`
      : `/events/class/${eventKeyName}`

  return (
    <Link href={eventUrl}>
      <Button
        size={'sm'}
        className="all ease text-pretty border-2 border-bgColor-brand bg-slate-100 text-sm font-bold text-bgColor-brand transition hover:bg-bgColor-brand/80 hover:text-slate-50 py-5"
      >
        Read more
      </Button>
    </Link>
  )
}

export default EventButton
