// Libraries
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// Components
import ClassScheduleItem from './ClassScheduleItem'
import TextPreview from '@/app/[locale]/components/TextPreview'
import PaymentOptions from '../_stripepayment/PaymentOptions'

// Interfaces & Types
import { EventSchedule } from '@prisma/client'
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
  stripePriceId: string
  stripeProductId: string
  schedules: EventSchedule[]
  keyName: string
  classId: string
  price: number
  title: string
  stripeSubscribedPriceId: string
  fullCourseDiscount?: number
  eventType: string
  shouldShowGallery?: boolean
  imageUrls: string[]
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
  stripePriceId,
  stripeProductId,
  stripeSubscribedPriceId,
  keyName,
  classId,
  price,
  fullCourseDiscount,
  eventType,
  capacity,
  shouldShowGallery = true,
  imageUrls,
}: ClassDescriptionProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])
  console.log(imageUrl)

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
          <div className="sticky top-[120px] z-[5] -mt-5 flex max-h-[800px] flex-col gap-y-10 overflow-y-auto px-[15px] pt-5 md:px-[20px]">
            <div className="flex flex-col rounded-2xl bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)]">
              {/* Date Row */}
              <div className="relative p-4">
                <div className="flex items-center gap-x-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-red-600" />
                  <span className="text-base">
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
              <div className="relative p-4">
                <div className="flex items-center gap-x-3">
                  <Clock className="h-5 w-5 shrink-0 text-red-600" />
                  <span className="text-base">
                    {days.map((day) => {
                      const translated = t(day)
                      return translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase()
                    }).join(', ')} at {startTime} -{' '}
                    {endTime}
                  </span>
                </div>
                <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
              </div>

              {/* Price Row */}
              <div className="relative p-4">
                <div className="flex items-center gap-x-3">
                  <Ticket className="h-5 w-5 shrink-0 rotate-[135deg] text-red-600" />
                  <span className="text-base">
                    {price === 0 ? 'Free' : `$${price.toString()}`}
                  </span>
                </div>
                <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
              </div>

              {/* Spots Left Row */}
              <div className="relative p-4">
                <div className="flex items-center justify-between gap-x-3">
                  <div className="flex items-center gap-x-3">
                    <Users className="h-5 w-5 shrink-0 text-red-600" />
                    <span className="text-base">
                      {capacity} spots available
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
              </div>

              {/* Location Row */}
              <div className="flex items-start gap-x-3 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div className="flex flex-col">
                  <span className="text-base">{location}</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div>
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location}`}
                title="Class Location"
                className="h-[300px] w-full rounded-2xl"
                allowFullScreen
              ></iframe>
            </div>

            {/* Payment Options */}
            <PaymentOptions
              stripePriceId={stripePriceId}
              stripeProductId={stripeProductId}
              stripeSubscribedPriceId={stripeSubscribedPriceId}
              formLink={formLink}
              eventKeyName={keyName}
              price={price}
              eventId={classId}
              title={title}
              userId={author}
              fullCourseDiscount={fullCourseDiscount}
              email={email}
              type={typeMap[eventType as keyof typeof typeMap]}
              loggedIn={author ? true : false}
            />

            {existingPayment && existingPayment.length > 0 && (
              <p className="font-medium text-green-600">{t('alreadyPaid')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="min-w-full">
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
        <div className="my-8">
          <EventGalleryCarousel imageUrls={imageUrls} />
        </div>
      )}
    </div>
  )
}

export default ClassDescription
