// Libraries
import initTranslation from '@/app/i18n'

// Components
import EventCardHorizontal from './EventCardHorizontal'
import EventCardVertical from './EventCardVertical'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Interfaces & Types
import { Event, EventCategory, EventTicket } from '@prisma/client'

interface EventListVerticalProps {
  events: (Event & {
    categories: EventCategory[]
    tickets?: EventTicket[]
  })[]
  locale: string
  title?: string
  fromHomePage?: boolean
}

// Main Component
const EventListVertical = async ({
  events,
  locale,
  title,
  fromHomePage = true,
}: EventListVerticalProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  // Limit the number of events if maxEvents is provided

  return (
    <div className="flex w-full flex-col items-center gap-y-5 bg-bgColor-secondary100 py-10 xl:py-14">
      {/* Header */}
      <h2 className="web_h1 text-center">{t(title || 'header-pastEvent')}</h2>
      {/* Event Cards */}
      {events.length > 0 ? (
        <div className="w-full max-w-7xl px-6 pt-5 md:mx-auto">
          {/* Mobile: Vertical Cards */}
          <div className="mx-auto flex flex-col gap-6 md:hidden">
            {events.map((event) => (
              <EventCardVertical key={event.id} event={event} locale={locale} />
            ))}
          </div>

          {/* Desktop: Horizontal Cards */}
          <div className="hidden flex-col gap-6 md:flex lg:gap-8">
            {events.map((event) => (
              <EventCardHorizontal
                key={event.id}
                event={event}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto p-4">
          <h2 className="text-lg text-gray-600">{t('noEvent')}</h2>
        </div>
      )}

      {/* More Events Button */}
      {fromHomePage && events.length > 0 && (
        <Button variant="default" className="mt-4 px-8 py-6">
          <Link href="/events" className="text-base font-bold">{t('more-events')}</Link>
        </Button>
      )}
    </div>
  )
}

export default EventListVertical
