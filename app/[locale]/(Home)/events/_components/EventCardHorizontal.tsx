// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Libraries
import initTranslation from '@/app/i18n'

// Components
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, CalendarDays, Ticket, ArrowRight } from 'lucide-react'

// Interfaces & Types
import { Event, EventCategory } from '@prisma/client'

interface EventCardHorizontalProps {
  event: Event & {
    categories: EventCategory[]
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
        <h3 className="text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl">
          {event.title}
        </h3>
        {hasStartedAndNotEnded && (
          <span className="text-sm font-medium text-bgColor-brand">
            (Started)
          </span>
        )}
      </div>

      {/* Event Details */}
      <div className="flex flex-1 flex-col gap-2 text-sm text-gray-700 md:gap-3 md:text-base lg:text-lg">
        {/* Date */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 flex-shrink-0 text-bgColor-brand md:h-5 md:w-5" />
          <span className="line-clamp-1">
            {event.startDate?.toLocaleDateString()} at{' '}
            {event.startDate?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0 text-bgColor-brand md:h-5 md:w-5" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 flex-shrink-0 rotate-45 text-bgColor-brand md:h-5 md:w-5" />
          <span>
            {String(event.price) === '0' ? 'Free' : '$' + event.price?.toString()} 
            {/* {event.priceMember ? '/$' + event.priceMember : null} */}
          </span>
        </div>
      </div>

      {/* Read More Link */}
      <Link
        href={`/events/${event.keyName}`}
        className="group/link flex-shrink-0 self-start text-base font-semibold text-bgColor-brand transition-all duration-300 hover:text-bgColor-brand/80 md:self-center md:text-lg"
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
