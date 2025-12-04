// Libraries
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getEventPrices } from '@/lib/actions/event/getEventPrices'

// Components
import ClassScheduleItem from './ClassScheduleItem'
import TextPreview from '@/app/[locale]/components/TextPreview'
import PaymentOptions from '../_stripepayment/PaymentOptions'

// Interfaces & Types
import { EventSchedule, EventTicket, EventSponsor } from '@prisma/client'
import EventGalleryCarousel from '../EventGalleryCarousel'
import Image from 'next/image'
import { CalendarDays, Ticket, Users, MapPin, Clock } from 'lucide-react'
interface ClassDescriptionProps {
  description: string
  imageUrl: string
  startDate: Date
  endDate: Date
  endTime: string
  startTime: string
  capacity: number
  location: string
  hosts: { name: string | null }[]
  locale: string
  days: string[]
  formLink: string

  schedules: EventSchedule[]
  keyName: string
  classId: string
  title: string
  eventType: string
  shouldShowGallery?: boolean
  imageUrls: string[]
  tickets: EventTicket[]
  sponsors: EventSponsor[]
}

const typeMap = {
  CLASS: 'Class',
  CONCERT: 'Concert',
  CAMPING: 'Camping',
  EVENT: 'Event',
}

// Main Code
const ClassDescription = async ({
  imageUrl,
  title,
  description,
  startDate,
  startTime,
  location,
  schedules,
  endTime,
  endDate,
  locale,
  days,
  formLink,
  keyName,
  classId,
  eventType,
  capacity,
  shouldShowGallery = true,
  imageUrls,
  tickets,
  sponsors,
}: ClassDescriptionProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  // Get the current user's id
  const session = await auth()
  const author = session?.user?.id!
  const email = session?.user?.email!

  // Check if user has already paid for this class
  const existingPayment = author
    ? await prisma.payment.findMany({
        where: {
          AND: [{ userId: author }, { eventId: classId }],
        },
      })
    : null

  return (
    <div className="w-full">
      <div className="mx-auto mt-5 flex max-w-[1280px] flex-col items-start gap-y-8 p-2 md:mt-10 lg:gap-y-8">
        {/* Event Info Section */}
        <div className="flex w-full flex-col gap-y-8 md:grid md:grid-cols-[1fr_400px] md:justify-between md:gap-x-4 md:gap-y-4 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_550px]">
          {/* Event Description */}
          <div className="">
            {/* <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
            {t('headerAbout')}
          </h1> */}

            <div className="relative aspect-video w-full">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <div className="mt-4 w-full text-pretty">
              <TextPreview value={description} />
            </div>
            {/* <p className="mt-2 text-muted-foreground">
          (To become a VVF member, please refer to the registration form using
          the reserve button below)
        </p> */}
          </div>

          {/* Info Section */}
          <div className="md:pl-[clamp(20px,4vw,100px)]">
            <h1 className="mb-2 text-xl font-bold md:hidden md:text-3xl lg:text-4xl">
              {t('headerInfo')}
            </h1>
            <div className="sticky top-[120px] z-[5] -mt-5 flex max-h-[80vh] flex-col gap-y-[clamp(0.5rem,2vh,2.5rem)] overflow-y-auto px-[15px] py-5 md:px-[20px]">
              <div className="flex h-[50vh] shrink-0 flex-col gap-y-[clamp(0.5rem,2vh,2.5rem)]">
                {/* Info Card */}
                <div className="flex shrink-0 flex-col rounded-2xl bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.3)]">
                  {/* Date Row */}
                  <div className="relative p-[clamp(0.5rem,1.5vh,1rem)]">
                    <div className="flex items-center gap-x-3">
                      <CalendarDays className="h-[clamp(0.75rem,2vh,1.25rem)] w-[clamp(0.75rem,2vh,1.25rem)] shrink-0 text-red-600" />
                      <span className="text-[clamp(0.75rem,1.5vh,1rem)]">
                        {startDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {startDate.getTime() !== endDate.getTime() && (
                          <>
                            {' - '}
                            {endDate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </>
                        )}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
                  </div>

                  {/* Time Row */}
                  <div className="relative p-[clamp(0.5rem,1.5vh,1rem)]">
                    <div className="flex items-center gap-x-3">
                      <Clock className="h-[clamp(0.75rem,2vh,1.25rem)] w-[clamp(0.75rem,2vh,1.25rem)] shrink-0 text-red-600" />
                      <span className="text-[clamp(0.75rem,1.5vh,1rem)]">
                        {days
                          .map((day) => {
                            const translated = t(day)
                            return (
                              translated.charAt(0).toUpperCase() +
                              translated.slice(1).toLowerCase()
                            )
                          })
                          .join(', ')}{' '}
                        at {startTime} - {endTime}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
                  </div>

                  {/* Price Row */}
                  <div className="relative p-[clamp(0.5rem,1.5vh,1rem)]">
                    <div className="flex items-center gap-x-3">
                      <Ticket className="h-[clamp(0.75rem,2vh,1.25rem)] w-[clamp(0.75rem,2vh,1.25rem)] shrink-0 rotate-[135deg] text-red-600" />
                      <span className="text-[clamp(0.75rem,1.5vh,1rem)]">
                        {getEventPrices(tickets)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
                  </div>

                  {/* Spots Left Row */}
                  <div className="relative p-[clamp(0.5rem,1.5vh,1rem)]">
                    <div className="flex items-center justify-between gap-x-3">
                      <div className="flex items-center gap-x-3">
                        <Users className="h-[clamp(0.75rem,2vh,1.25rem)] w-[clamp(0.75rem,2vh,1.25rem)] shrink-0 text-red-600" />
                        <span className="text-[clamp(0.75rem,1.5vh,1rem)]">
                          {capacity} spots available
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
                  </div>

                  {/* Location Row */}
                  <div className="flex items-start gap-x-3 p-[clamp(0.5rem,1.5vh,1rem)]">
                    <MapPin className="mt-0.5 h-[clamp(0.75rem,2vh,1.25rem)] w-[clamp(0.75rem,2vh,1.25rem)] shrink-0 text-red-600" />
                    <div className="flex flex-col">
                      <span className="text-[clamp(0.75rem,1.5vh,1rem)]">
                        {location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="flex min-h-0 flex-1">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location}`}
                    title="Class Location"
                    className="h-full w-full rounded-2xl"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Payment Options */}
              <PaymentOptions
                formLink={formLink}
                eventKeyName={keyName}
                eventId={classId}
                title={title}
                userId={author}
                email={email}
                type={typeMap[eventType as keyof typeof typeMap]}
                loggedIn={author ? true : false}
                tickets={tickets}
              />

              {existingPayment && existingPayment.length > 0 && (
                <p className="text-[clamp(0.75rem,1.5vh,1rem)] font-medium text-green-600">
                  {t('alreadyPaid')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sponsors */}
        <div className="min-w-full">
          <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
            {t('headerSponsors')}
          </h1>
          <div className="flex w-full gap-x-4 pt-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="flex w-[200px] flex-col items-center justify-center gap-y-2"
              >
                <Image
                  src={sponsor.imgUrl}
                  alt={sponsor.name}
                  width={150}
                  height={150}
                />
                {sponsor.displayName && (
                  <span className="text-sm font-medium">{sponsor.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="mt-4 min-w-full">
          <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
            {t('headerSchedule')}
          </h1>
          <h3 className="mb-2 italic">({t('subHeaderSchedule')})</h3>
          <div className="flex flex-col gap-y-4">
            {/* Sort by position, and then filter out the ones that don't have a startTime, endTime, or description */}
            {schedules
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .map(
                (schedule) =>
                  schedule.startTime &&
                  schedule.endTime &&
                  schedule.description && (
                    <ClassScheduleItem
                      key={schedule.id}
                      startTime={schedule.startTime}
                      endTime={schedule.endTime}
                      description={schedule.description}
                      locale={locale}
                    />
                  )
              )}
          </div>
        </div>

        {/* Gallery Carousel at the bottom */}
        {shouldShowGallery && (
          <div className="mb-8 mt-4">
            <EventGalleryCarousel imageUrls={imageUrls} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ClassDescription
