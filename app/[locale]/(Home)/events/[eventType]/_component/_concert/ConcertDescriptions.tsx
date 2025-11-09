import React from 'react'
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { EventSchedule } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import TextPreview from '@/app/[locale]/components/TextPreview'
import PaymentOptions from '../_stripepayment/PaymentOptions'
import EventGalleryCarousel from '../EventGalleryCarousel'
import { CalendarDays, Ticket, Users, MapPin } from 'lucide-react'

type EventWithRelations = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  location: string | null
  startTime: string | null
  endTime: string | null
  capacity: number | null
  startDate: Date | null
  endDate: Date
  price: Decimal | null
  stripePriceId: string | null
  stripeProductId: string | null
  subscribedPriceId: string | null
  formLink: string | null
  keyName: string
  fullCourseDiscount: number | null
  hosts: { name: string | null }[]
  schedules: EventSchedule[]
  eventType: string
  imgUrls: string[]
}

interface ConcertDescriptionsProps {
  event: EventWithRelations
  locale: string
  shouldShowGallery?: boolean
}

const typeMap = {
  CLASS: 'Class',
  CONCERT: 'Concert',
  CAMPING: 'Camping',
  EVENT: 'Event',
}

const ConcertDescriptions = async ({
  event,
  locale,
  shouldShowGallery = true,
}: ConcertDescriptionsProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  // Get the current user's id
  const session = await auth()
  const author = session?.user?.id!
  const email = session?.user?.email!

  // Check if user has already paid for this event
  const existingPayment = author
    ? await prisma.payment.findMany({
        where: {
          AND: [{ userId: author }, { eventId: event.id }],
        },
      })
    : null

  return (
    <div className="w-full bg-bgColor-secondary200 py-16">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-y-12 p-6 md:p-12 lg:gap-y-16 lg:p-16">
        {/* Event Info Section */}
        <div className="flex w-full flex-col gap-y-8 md:grid md:grid-cols-[1fr_400px] md:justify-between md:gap-x-4 md:gap-y-4 lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_550px]">
          {/* Event Description */}
          <div className="">
            {/* <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
            {t('headerAbout')}
          </h1> */}

            <div className="w-full text-pretty">
              <TextPreview value={event.description || ''} />
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
                {/* Date and Time Row */}
                <div className="relative p-4">
                  <div className="flex items-center gap-x-3">
                    <CalendarDays className="h-5 w-5 shrink-0 text-red-600" />
                    <span className="text-base">
                      {event.startDate?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {event.startDate?.getTime() !== event.endDate?.getTime() && (
                        <>
                          {' - '}
                          {event.endDate?.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </>
                      )}{' '}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
                </div>

                {/* Price Row */}
                <div className="relative p-4">
                  <div className="flex items-center gap-x-3">
                    <Ticket className="h-5 w-5 shrink-0 rotate-[135deg] text-red-600" />
                    <span className="text-base">
                      {event.price?.toNumber() === 0 ? 'Free' : `$${event.price?.toNumber().toString()}`}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
                </div>

                {/* Spots Left Row */}
                <div className="relative p-4">
                  <div className="flex items-center justify-between gap-x-3">
                    <div className="flex items-center gap-x-3">
                      <Users className="h-5 w-5 shrink-0 text-red-600" />
                      <span className="text-base">{event.capacity} spots left</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 w-[93%] -translate-x-1/2 border-b border-gray-200"></div>
                </div>

                {/* Location Row */}
                <div className="flex items-start gap-x-3 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div className="flex flex-col">
                    <span className="text-base">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div>
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${event.location}`}
                  title="Class Location"
                  className="h-[300px] w-full rounded-2xl"
                  allowFullScreen
                ></iframe>
              </div>

              {existingPayment && existingPayment.length > 0 && (
                <p className="font-medium text-green-600">{t('alreadyPaid')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        {event.schedules && event.schedules.length > 0 && (
          <div className="w-full space-y-6">
            <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
              {t('headerSchedule')}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {event.schedules
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map(
                  (schedule) =>
                    schedule.startTime &&
                    schedule.endTime &&
                    schedule.description && (
                      <div
                        key={schedule.id}
                        className="rounded-lg bg-bgColor-brand900 p-4 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                      >
                        <div className="mb-2 text-sm font-medium text-white/80">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <p className="text-white">{schedule.description}</p>
                      </div>
                    )
                )}
            </div>
          </div>
        )}

        {/* Payment Options */}
        {author ? (
          <div className="w-full">
            <PaymentOptions
              stripePriceId={event.stripePriceId!}
              stripeProductId={event.stripeProductId!}
              stripeSubscribedPriceId={event.subscribedPriceId!}
              formLink={event.formLink!}
              eventKeyName={event.keyName}
              price={event.price?.toNumber() || 0}
              eventId={event.id}
              title={event.title}
              userId={author}
              fullCourseDiscount={event.fullCourseDiscount || 0}
              email={email}
              type={typeMap[event.eventType as keyof typeof typeMap]}
              loggedIn={author ? true : false}
            />

            {existingPayment && existingPayment.length > 0 && (
              <p className="mt-4 font-medium text-green-400">
                {t('alreadyPaid')}
              </p>
            )}
          </div>
        ) : (
          <p className="italic text-white/80">{t('loginToMakePayment')}</p>
        )}

        {/* Gallery Carousel at the bottom */}
        {shouldShowGallery && (
          <div className="my-8">
            <EventGalleryCarousel imageUrls={event.imgUrls as string[]} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ConcertDescriptions
