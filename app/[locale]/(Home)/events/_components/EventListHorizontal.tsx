// Libraries
import initTranslation from '@/app/i18n'

// Components
import EventCardVertical from './EventCardVertical'
import EventPagination from './EventPagination'
import Image from 'next/image'

// Interfaces & Types
import { Event, EventCategory, EventTicket } from '@prisma/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Actions
import { getClosestFutureEvent } from '@/lib/actions/event/getClosestEvent'

// Interfaces & Types
interface EventListHorizontalProps {
  events: (Event & {
    categories: EventCategory[]
    tickets?: EventTicket[]
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

  // Get the closest future event
  const closestEvent = await getClosestFutureEvent()

  return (
    <div
      className={`flex w-full flex-col items-center gap-y-5 bg-bgColor-secondary100 py-10 xl:pt-10`}
    >
      {finished ? (
        <h2 className="web_h1 text-center">{t('header-finishedEvent')}</h2>
      ) : (
        <>
          <h2 className="web_h1 text-center">
            {fromHomePage
              ? t('header-upcomingEvent-homepage')
              : t('header-upcomingEvent')}
          </h2>
          {!closestEvent && fromHomePage && (
            <h3 className="web-body-regular text-center">{t('plan-ahead')}</h3>
          )}
          {/* Text for latest events - only show if there's a future event */}
          {closestEvent && (
            <div className="flex w-full justify-center">
              <div className="max-w-7xl rounded-lg text-center">
                <p className="web-body-large overflow-hidden text-ellipsis sm:whitespace-normal">
                  <Image
                    src="https://drive.google.com/thumbnail?id=1KOA45MZfxUJyqGmNMO7x00U-bYXHJmaU"
                    alt="Penguin icon"
                    width={50}
                    height={50}
                    className="mr-2 inline-block align-middle"
                  />
                  {t('event-hot-text')} <strong>{closestEvent.title}</strong>,{' '}
                  {t('event-happening-on')}{' '}
                  {closestEvent.startDate &&
                    new Date(closestEvent.startDate).toLocaleDateString(
                      locale,
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }
                    )}
                  {closestEvent.startTime &&
                    ` ${t('event-at')} ${closestEvent.startTime}`}{' '}
                  -
                  {/* {closestEvent.endDate &&
                 new Date(closestEvent.endDate).toLocaleDateString(locale)}
               {closestEvent.endTime && ` at ${closestEvent.endTime}`}  */}{' '}
                  {/* - {t('event-few-spots-left')}{' '} */}
                  <Link
                    href={`/${locale}/events/${closestEvent.eventType.toLowerCase()}/${closestEvent.keyName}`}
                    className="group inline-flex items-center gap-1 font-semibold underline transition-colors hover:text-bgColor-brand900"
                  >
                    {t('event-dont-miss-chance')}
                    <Image
                      src="https://drive.google.com/thumbnail?id=1KOA45MZfxUJyqGmNMO7x00U-bYXHJmaU"
                      alt="Penguin icon"
                      width={50}
                      height={50}
                      className="ml-2 inline-block align-middle"
                    />
                  </Link>
                </p>
              </div>
            </div>
          )}
        </>
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
              src="https://drive.google.com/thumbnail?id=1KOA45MZfxUJyqGmNMO7x00U-bYXHJmaU"
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
          <Link href="/events" className="text-base font-bold">
            {t('more-events')}
          </Link>
        </Button>
      )}
    </div>
  )
}

export default EventListHorizontal
