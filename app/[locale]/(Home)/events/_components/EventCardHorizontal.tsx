// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Libraries
import initTranslation from '@/app/i18n'
import { getEventPrices } from '@/lib/actions/event/getEventPrices'
import moment from 'moment-timezone'

// Components
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, CalendarDays, Ticket, ArrowRight } from 'lucide-react'

// Interfaces & Types
import { Event, EventCategory, EventTicket } from '@prisma/client'

interface EventCardHorizontalProps {
  event: Event & {
    categories: EventCategory[]
    tickets?: EventTicket[]
  }
  locale: string
}

const EventCardHorizontal = async ({
  event,
  locale,
}: EventCardHorizontalProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  const now = new Date()
  const hasStartedAndNotEnded =
    event.startDate &&
    event.endDate &&
    new Date(event.startDate) <= now &&
    new Date(event.endDate) >= now
  const startDateVancouver = moment(event.startDate).tz('America/Vancouver')

  return (
    <div className="group relative flex h-[165px] w-full flex-col gap-4 rounded-3xl bg-white p-4 shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] md:flex-row md:items-center md:gap-6 md:p-6">
      {/* Event Image */}
      <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-lg md:h-24 md:w-32 lg:h-32 lg:w-40">
        <Image
          src={event.imgUrl!}
          alt="event thumbnail"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Event Title */}
      <div className="flex w-[20vw] max-w-[400px] flex-col justify-center gap-2">
        <h3 className="web_h3">{event.title}</h3>
        {hasStartedAndNotEnded && (
          <span className="text-sm font-medium text-bgColor-brand900">
            (Started)
          </span>
        )}
      </div>

      {/* Event Details */}
      <div className="web-body-regular flex flex-1 flex-col gap-2 md:gap-3">
        {/* Date */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 flex-shrink-0 text-bgColor-brand900 md:h-5 md:w-5" />
          <span className="line-clamp-1">
            {startDateVancouver.format('MMM D, YYYY')}{' '}
            at{' '}
            {event.startTime}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-bgColor-brand900 md:h-5 md:w-5" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 flex-shrink-0 rotate-45 text-bgColor-brand900 md:h-5 md:w-5" />
          <span>
            {getEventPrices(event.tickets)}
          </span>
        </div>
      </div>

      {/* Read More Link */}
      <Link
        href={`/events/${event.eventType.toLowerCase()}/${event.keyName}`}
        className="group/link web-button-bold flex-shrink-0 self-start text-bgColor-brand900 transition-all duration-300 hover:text-bgColor-brand600 md:self-center"
        aria-label={`Read more about event: ${event.title}`}
      >
        <div className="flex items-center gap-2">
          <span>{t('read-more')}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1 md:h-5 md:w-5" />
        </div>
      </Link>
    </div>
  )
}

export default EventCardHorizontal
