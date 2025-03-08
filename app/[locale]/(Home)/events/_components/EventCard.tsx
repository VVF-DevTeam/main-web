// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Libraries
import { cn } from '@/lib/utils'

// Components
import Image from 'next/image'
import { Tag, MapPin, Ticket, CalendarDays } from 'lucide-react'
import EventButton from './EventButton'

// Interfaces & Types
import { Event } from '@prisma/client'
interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="hover-focus-zoomIn group relative flex w-[calc(100%-3px)] cursor-pointer flex-col rounded-lg bg-slate-50 shadow-xl hover:bg-slate-100">
      <Image
        src={event.imgUrl!}
        alt="event thumbnail"
        width={390}
        height={255}
        className="hover-opacity-blur z-0 max-h-[300px] w-full basis-1/2 rounded-t-lg object-cover"
      />

      <div className="flex basis-1/2 flex-col gap-y-6 p-4 text-base md:text-lg">
        {/* Tags */}
        <div
          className={cn(
            'absolute left-3 top-2 mx-auto max-w-[30%] rounded-xl px-2 py-1 text-center text-base font-semibold text-textColor-white opacity-100 transition-all duration-100',
            event.eventType === 'CLASS'
              ? 'bg-blue-950 hover:bg-blue-700/80'
              : 'bg-yellow-500 hover:bg-yellow-400/80'
          )}
        >
          {event.eventType.toLowerCase()}
        </div>

        {/* Title */}
        <h2 className="mb-4 text-center text-2xl font-bold">{event.title}</h2>

        {/* Price and availability */}
        <div className="flex-between">
          <span className="flex items-center gap-x-2">
            <Tag className="h-5 w-5"></Tag>${event.price}
            {event.priceMember ? '/$' + event.priceMember : null}
          </span>
          <span className="flex-center gap-x-2">
            <Ticket className="h-5 w-5 rotate-45"></Ticket>
            {event.capacity! - event.ticketsSold! === 0
              ? 'Sold Out'
              : event.capacity! - event.ticketsSold!}{' '}
            remaining
          </span>
        </div>

        {/* Location */}
        <div className="flex-between">
          <span className="flex items-center gap-x-2 text-xl text-muted-foreground">
            <MapPin className="h-5 w-5"></MapPin>
            {event.location}
          </span>
          <EventButton eventId={event.id} eventType={event.eventType} />
        </div>

        {/* Timings */}
        <div className="flex-between rounded-lg bg-bgColor-brand/20 p-4 transition-all duration-100 group-hover:bg-bgColor-brand/30">
          <span className="flex items-center gap-x-2 text-sm md:text-lg">
            <CalendarDays className="h-4 w-4 md:h-5 md:w-5"></CalendarDays>
            {event.startDate.toLocaleDateString('en-GB', {})}
          </span>

          <div className="flex flex-col text-right text-sm md:text-base xl:text-lg">
            <span>
              {event?.days?.map((day) => (
                <span key={day}>{day.substring(0, 3)}, </span>
              ))}
            </span>
            <span className="ml-auto">
              at {event.startTime.toLocaleString().substring(0, 5)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
