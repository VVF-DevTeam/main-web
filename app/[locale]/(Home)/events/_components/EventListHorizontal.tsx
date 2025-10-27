// Libraries
import initTranslation from '@/app/i18n'

// Components
import EventCardVertical from './EventCardVertical'
import EventPagination from './EventPagination'
import Image from 'next/image'

// Interfaces & Types
import { Event, EventCategory } from '@prisma/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Interfaces & Types
interface EventListHorizontalProps {
  events: (Event & {
    categories: EventCategory[]
  })[]
  locale: string
  finished?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  fromHomePage?: boolean
}

// Main Component
const EventListHorizontal = async ({
  events,
  locale,
  finished,
  currentPage,
  totalPages,
  totalItems,
  fromHomePage,
}: EventListHorizontalProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div
      className={`flex w-full flex-col items-center gap-y-5 py-10 xl:gap-y-12 xl:pt-20 ${fromHomePage ? 'bg-[#FEFAF4]' : finished ? 'bg-gray-100' : ''}`}
    >
      {finished ? (
        <h2 className="header-main text-center">{t('header-finishedEvent')}</h2>
      ) : (
        <h2 className="header-main text-center">
          {fromHomePage
            ? t('header-upcomingEvent-homepage')
            : t('header-upcomingEvent')}
        </h2>
      )}
      {events.length > 0 ? (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-x-12 gap-y-6 p-6 pb-4 md:grid md:grid-cols-2 md:gap-y-12 lg:grid-cols-3 lg:justify-items-center">
          {events.map((event) => (
            <EventCardVertical key={event.id} event={event} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="mx-auto p-4">
          <div className="flex items-center gap-x-2">
            <Image
              src="https://drive.google.com/thumbnail?id=1KOA45MZfxUJyqGmNMO7x00U-bYXHJmaU&sz=w1000"
              alt="Penguin icon"
              width={50}
              height={50}
              className="inline-block align-middle"
            />
            <h2 className="text-sm text-textColor">{t('noEvent')}</h2>
          </div>
        </div>
      )}

      {/* Pagination */}
      {currentPage && totalPages && totalPages > 0 ? (
        <EventPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageType={finished ? 'finished' : 'upcoming'}
          showPageInfo={false}
          totalItems={totalItems}
        />
      ) : null}

      {/* From Home Page button */}
      {fromHomePage && (
        <Button variant="default" className="px-8 py-6">
          <Link href="/events">More Events</Link>
        </Button>
      )}
    </div>
  )
}

export default EventListHorizontal
