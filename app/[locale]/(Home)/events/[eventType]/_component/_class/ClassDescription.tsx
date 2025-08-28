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
interface ClassDescriptionProps {
  description: string
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
}

const typeMap = {
  CLASS: 'Class',
  CONCERT: 'Concert',
  CAMPING: 'Camping',
  EVENT: 'Event',
}

// Main Code
const ClassDescription = async ({
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
    <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-y-8 p-6 md:p-12 lg:gap-y-8 lg:p-16">
      {/* Time and Location */}
      <div className="grid w-full justify-between gap-x-4 gap-y-4 md:flex">
        <div className="flex flex-col gap-y-2">
          <h1 className="mb-2 text-xl font-bold md:text-3xl lg:text-4xl">
            {t('headerInfo')}
          </h1>

          {/* Date */}
          <p>
            {t('dateHeader')}:{' '}
            {startDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}{' '}
            {/* If the start date and end date are the same, don't show the end date */}
            {startDate.getTime() === endDate.getTime() ? (
              <p></p>
            ) : (
              <>
                -{' '}
                {endDate.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </>
            )}
          </p>

          {/* Time */}
          <p>
            {t('timeHeader')}:{' '}
            {days.map((day) => t(day.toLowerCase())).join(', ')}{' '}
            {t('everyWeek')}, {startTime} - {endTime}
          </p>
          <p>
            {t('location')}: {location}
          </p>
        </div>

        {/* Map */}
        <div>
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location}`}
            title="Class Location"
            width="300"
            height="250"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Event Description */}
      <div>
        <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
          {t('headerAbout')}
        </h1>
        <div className="mt-4 w-full text-pretty">
          <TextPreview value={description} />
        </div>
        {/* <p className="mt-2 text-muted-foreground">
          (To become a VVF member, please refer to the registration form using
          the reserve button below)
        </p> */}
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

      {/* Payment Options */}
      {author ? (
        <>
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
          />

          {existingPayment && existingPayment.length > 0 && (
            <p className="font-medium text-green-600">{t('alreadyPaid')}</p>
          )}
        </>
      ) : (
        <p className="italic">{t('loginToMakePayment')}.</p>
      )}
    </div>
  )
}

export default ClassDescription
