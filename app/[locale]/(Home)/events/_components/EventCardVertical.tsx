// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Libraries
import { cn } from '@/lib/utils'
import initTranslation from '@/app/i18n'
import Link from 'next/link'
import { getEventPrices } from '@/lib/actions/event/getEventPrices'
// Components
import Image from 'next/image'
import { MapPin, Ticket, CalendarDays, CalendarClock } from 'lucide-react'
// import EventButton from './EventButton'

// Interfaces & Types
import { Event, EventCategory, EventTicket } from '@prisma/client'

interface EventCardVerticalProps {
  event: Event & {
    categories: EventCategory[]
    tickets?: EventTicket[]
  }
  locale: string
}

const EventCardVertical = async ({ event, locale }: EventCardVerticalProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  const now = new Date()
  const hasStartedAndNotEnded =
    event.startDate &&
    event.endDate &&
    new Date(event.startDate) <= now &&
    new Date(event.endDate) >= now

  return (
    <div className="group relative mx-auto flex w-full max-w-[360px] flex-col rounded-2xl bg-slate-50 shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-105 hover:bg-slate-100 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)]">
      <Link href={`/events/${event.eventType.toLowerCase()}/${event.keyName}`}>
        <div className="aspect-[4/3] w-full p-5">
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            <Image
              src={event.imgUrl!}
              alt={`Thumbnail for ${event.title} event`}
              fill
              priority={false}
              sizes="(min-width: 1280px) 400px, (min-width: 1024px) 350px, (min-width: 768px) 300px, 100vw"
              className="hover-opacity-blur z-0 object-cover"
            />
          </div>
        </div>

        <div className="flex basis-1/2 flex-col gap-y-3 p-4 pt-0 text-base md:text-lg">
          {/* Tags */}
          <div className="absolute left-7 top-7 flex flex-wrap gap-2">
            {event.categories
              ?.sort((a) => (a.type.toLowerCase() === 'primary' ? -1 : 1))
              .map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    'rounded-xl px-3 text-center text-[14px] text-textColor-white opacity-100 transition-all duration-100',
                    category.isBold && 'font-bold',
                    category.isItalic && 'italic'
                  )}
                  style={{
                    backgroundColor: category.bgColor,
                    color: category.textColor,
                  }}
                >
                  {category.title}
                </div>
              ))}
          </div>

          {/* Title */}
          <h2 className="mb-4 text-2xl font-[900]" style={{ fontFamily: 'var(--font-lato)' }}>
            {event.title} {hasStartedAndNotEnded && <span>(Started)</span>}
          </h2>

          {/* Date */}
          <div className="flex items-center gap-x-2">
            <CalendarDays className="h-4 w-4 text-bgColor-brand900 md:h-5 md:w-5" />
            <span className="text-base">
              {event.startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}{' '}
              -{' '}
              {event.endDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Time  */}
          <div className="flex items-center gap-x-2 text-base">
            <CalendarClock className="h-4 w-4 text-bgColor-brand900 md:h-5 md:w-5" />
            <span>
              {event?.days?.map((day) => (
                <span key={day}>{t(day.toLowerCase())}, </span>
              ))}
            </span>
            <span className="-ml-1">
              at {event.startTime.toLocaleString().substring(0, 5)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-x-2 text-base">
            <span className="flex items-center gap-x-2">
              <MapPin className="h-4 w-4 shrink-0 text-bgColor-brand900 md:h-5 md:w-5" />
              {event.location}
            </span>
            {/* <EventButton
            eventKeyName={event.keyName}
            eventType={event.eventType}
          /> */}
          </div>

          {/* Price and availability */}
          <div className="flex items-center gap-x-2 text-base">
            <span className="flex items-center gap-x-2">
              <Ticket className="h-4 w-4 rotate-[135deg] text-bgColor-brand900 md:h-5 md:w-5" />
              {getEventPrices(event.tickets, Number(event.price))}
              {/* {event.priceMember ? '/$' + event.priceMember : null} */}
            </span>
          </div>

          {/* Timings */}
          {/* <div className="flex-between rounded-lg bg-bgColor-brand600/20 p-4 transition-all duration-100 group-hover:bg-bgColor-brand400">
          <span className="flex items-center gap-x-2 text-sm md:text-lg">
            <CalendarDays className="h-4 w-4 md:h-5 md:w-5" />
            <div>
              {event.startDate.getTime() === event.endDate.getTime() ? (
                <p>{event.startDate.toLocaleDateString('en-GB')}</p>
              ) : (
                <>
                  <p>{event.startDate.toLocaleDateString('en-GB')}</p>
                  <p>{event.endDate.toLocaleDateString('en-GB')}</p>
                </>
              )}
            </div>
          </span>

          <div className="flex flex-col text-right text-sm md:text-base xl:text-lg">
            <span>
              {event?.days?.map((day) => (
                <span key={day}>{t(day.toLowerCase())}, </span>
              ))}
            </span>
            <span className="ml-auto">
              at {event.startTime.toLocaleString().substring(0, 5)}
            </span>
          </div>
        </div> */}
        </div>
      </Link>
    </div>
  )
}

export default EventCardVertical
