import React from 'react'
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { EventSchedule } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import TextPreview from '@/app/[locale]/components/TextPreview'
import PaymentOptions from '../_stripepayment/PaymentOptions'
import EventGalleryCarousel from '../EventGalleryCarousel'

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
    <div className="w-full bg-bgColor-brandDark900 py-16 text-white">
      <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-y-12 p-6 md:p-12 lg:gap-y-16 lg:p-16">
        {/* Event Info Section */}
        <div className="grid w-full gap-8 md:grid-cols-2">
          {/* Left Column - Event Details */}
          <div className="flex flex-col gap-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
                {t('headerInfo')}
              </h2>
              <div className="space-y-2 text-lg">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">{t('dateHeader')}:</span>
                  {event.startDate?.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  {/* If the start date and end date are the same, don't show the end date */}
                  {event.startDate?.getTime() === event.endDate?.getTime() ? (
                    <p></p>
                  ) : (
                    <>
                      -{' '}
                      {event.endDate?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </>
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">{t('timeHeader')}:</span>
                  {event.startTime} - {event.endTime}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">{t('location')}:</span>
                  {event.location}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">{t('slot')}:</span>
                  {event.capacity}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="h-[300px] w-full overflow-hidden rounded-lg">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${event.location}`}
              title="Event Location"
              width="100%"
              height="100%"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        </div>

        {/* Description Section */}
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
            {t('headerAbout')}
          </h2>
          <div className="prose prose-invert max-w-none">
            <TextPreview value={event.description || ''} />
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
                        className="rounded-lg bg-white/10 p-4 backdrop-blur-sm"
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
