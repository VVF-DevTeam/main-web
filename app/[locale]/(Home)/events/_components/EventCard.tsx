// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use client'

import { Event } from '@prisma/client'
import Image from 'next/image'
import { Tag, MapPin, Ticket, CalendarDays, Armchair } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  const { t } = useTranslation()  
  const router = useRouter()

  return (
    <div
      className="flex h-full w-full flex-col rounded-lg bg-slate-50 shadow-xl hover:bg-slate-100 hover:scale-[103%] transition-all duration-300 ease-in-out"
      onClick={() => event.id === 'elenaDance' ? '': router.push(`/events/class/${event.id}`)}
    >
      <div className="relative aspect-video h-full w-full basis-1/2">
        <Image
          src={event.thumbnail!}
          alt="event thumbnail"
          className="absolute rounded-t-lg object-cover"
          loading="eager"
          fill
        />
      </div>
      <div className="flex flex-col gap-y-4 p-4 text-base md:text-lg">
        <h2 className="text-center text-3xl font-bold tracking-wider">
          {event.title}
        </h2>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-2">
            <Tag className="h-5 w-5"></Tag>${event.price}{event.priceMember? '/$' + event.priceMember: null} 
          </span>
          <span className="flex items-center gap-x-2">
            <Ticket className="h-5 w-5 rotate-45"></Ticket>
            {event.capacity! - event.ticketsSold!} {t('remaining', { ns: 'event'}) }
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-2 text-xl text-muted-foreground">
            <MapPin className="h-5 w-5"></MapPin>
            {event.location}
          </span>
          {event.sessionCount?<span className="flex items-center gap-x-2 text-xl text-muted-foreground">
            <Armchair className="h-5 w-5"></Armchair>
            {event.sessionCount} {t('sessions', { ns: 'event'})}
          </span> : null}
        </div>
        <div className="rounded-lg bg-[#C54B3E]/20">
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col text-left text-xs md:text-sm lg:text-lg">
              <span className="flex items-center gap-x-2 text-xs md:text-lg">
                <CalendarDays className="h-4 w-4 md:h-5 md:w-5"></CalendarDays>
                {event.startDate.toLocaleDateString('en-GB', {})}
              </span>
            </div>
            <div className="flex flex-col text-right text-xs md:text-sm lg:text-lg">
              <span>{event.dates.map((date) => date).join(', ')}</span>
              <span className="ml-auto">
                {' '}
                at {event.startTime.toLocaleTimeString('en-GB', {}).substring(0, 5)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
