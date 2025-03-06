// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Event } from '@prisma/client'
import Image from 'next/image'
import { Tag, MapPin, Ticket, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import EventButton from './EventButton'
interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="group relative flex w-[470px] cursor-pointer flex-col rounded-lg bg-slate-50 shadow-xl transition-all duration-300 ease-in-out hover:bg-slate-100 md:w-[370px] xl:w-[400px]">
      <Image
        src={event.imgUrl!}
        alt="event thumbnail"
        width={390}
        height={255}
        className="ease z-0 max-h-[300px] w-full basis-1/2 rounded-t-lg object-cover transition-all duration-200 group-hover:opacity-80 group-hover:blur-[10]"
      />

      <div className="abosolute flex basis-1/2 flex-col gap-y-6 p-4 text-base md:text-lg">
        {/* Tags */}
        <div
          className={cn(
            event.eventType === 'CLASS'
              ? 'absolute left-3 top-2 mx-auto max-w-[30%] rounded-xl bg-blue-950 px-2 py-1 text-center text-base font-semibold text-slate-50 opacity-100 transition-all duration-100 hover:bg-blue-700/80'
              : 'absolute left-3 top-2 mx-auto max-w-[30%] rounded-xl bg-yellow-500 px-2 py-1 text-center text-base font-semibold text-slate-50 opacity-100 transition-all duration-100 hover:bg-blue-700/80'
          )}
        >
          {event.eventType.toLowerCase()}
        </div>
        <h2 className="mb-4 text-center text-2xl font-bold">{event.title}</h2>

        {/* Price and availability */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-2">
            <Tag className="h-5 w-5"></Tag>${event.price}{event.priceMember? '/$' + event.priceMember: null} 
          </span>
          <span className="flex items-center gap-x-2">
            <Ticket className="h-5 w-5 rotate-45"></Ticket>
            {event.capacity! - event.ticketsSold! === 0
              ? 'Sold Out'
              : event.capacity! - event.ticketsSold!}{' '}
            remaining
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-2 text-xl text-muted-foreground">
            <MapPin className="h-5 w-5"></MapPin>
            {event.location}
          </span>
          <EventButton eventId={event.id} eventType={event.eventType}/>
        </div>

        {/* Timings */}
        <div className="ease flex items-center justify-between rounded-lg bg-[#C54B3E]/90 p-4 text-[#f7f1f1] transition-all duration-100 group-hover:bg-[#C54B3E]/90">
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
