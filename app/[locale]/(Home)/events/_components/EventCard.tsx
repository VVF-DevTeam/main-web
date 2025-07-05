// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Libraries
import { cn } from '@/lib/utils'
import initTranslation from '@/app/i18n'

// Components
import Image from 'next/image'
import { Tag, MapPin, Ticket, CalendarDays } from 'lucide-react'
import EventButton from './EventButton'

// Interfaces & Types
import { Event, EventCategory } from '@prisma/client'

interface EventCardProps {
  event: Event & {
    categories: EventCategory[]
  }
  locale: string
}

const EventCard = async ({ event, locale }: EventCardProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  const now = new Date()
  const hasStartedAndNotEnded =
    event.startDate &&
    event.endDate &&
    new Date(event.startDate) <= now &&
    new Date(event.endDate) >= now

  return (
    <div className="group relative flex w-[calc(100%-3px)] flex-col rounded-lg bg-slate-50 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-slate-100 xl:min-w-[400px]">
      <Image
        src={event.imgUrl!}
        alt="event thumbnail"
        width={390}
        height={255}
        className="hover-opacity-blur z-0 max-h-[300px] w-full basis-1/2 rounded-t-lg object-cover"
      />

      <div className="flex basis-1/2 flex-col gap-y-6 p-4 text-base md:text-lg">
        {/* Tags */}
        <div className="absolute left-3 top-2 flex flex-wrap gap-2">
          {event.categories
            ?.sort((a) => (a.type.toLowerCase() === 'primary' ? -1 : 1))
            .map((category) => (
              <div
                key={category.id}
                className={cn(
                  'rounded-xl px-2 py-1 text-center text-base font-semibold text-textColor-white opacity-100 transition-all duration-100',
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
        <h2 className="mb-4 text-center text-2xl font-bold">
          {event.title} {hasStartedAndNotEnded && <span>(Started)</span>}
        </h2>

        {/* Price and availability */}
        <div className="flex-between">
          <span className="flex items-center gap-x-2">
            <Tag className="h-5 w-5" />${event.price?.toString()}
            {event.priceMember ? '/$' + event.priceMember : null}
          </span>
          <span className="flex-center gap-x-2">
            <Ticket className="h-5 w-5 rotate-45" />
            {event.capacity! - event.ticketsSold! === 0
              ? 'Sold Out'
              : event.capacity! - event.ticketsSold!}{' '}
            {t('slot-event')}
          </span>
        </div>

        {/* Location */}
        <div className="flex-between gap-x-2">
          <span className="flex items-center gap-x-2 text-xl text-muted-foreground">
            <MapPin className="h-5 w-5" />
            {event.location}
          </span>
          <EventButton
            eventKeyName={event.keyName}
            eventType={event.eventType}
          />
        </div>

        {/* Timings */}
        <div className="flex-between rounded-lg bg-bgColor-brand/20 p-4 transition-all duration-100 group-hover:bg-bgColor-brand/30">
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
        </div>
      </div>
    </div>
  )
}

export default EventCard
