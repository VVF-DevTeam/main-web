// Libraries
import initTranslation from '@/app/i18n'

// Components
import ScheduleItem from './ScheduleItem'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import TextPreview from '@/app/[locale]/components/TextPreview'

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
  schedules: EventSchedule[]
}

// Main Code
const ClassDescription = async ({
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
}: ClassDescriptionProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-y-8 p-6 md:p-12 lg:gap-y-8 lg:p-16">
      {/* Time and Location */}
      <div className="grid w-full justify-between gap-x-4 gap-y-4 md:flex">
        <div className="flex flex-col gap-y-2">
          <h1 className="mb-2 text-xl font-bold md:text-3xl lg:text-4xl">
            {t('headerInfo')}
          </h1>
          <p>
            {t('dateHeader')}:{' '}
            {startDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}{' '}
            -{' '}
            {endDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
            ,
          </p>
          <p>
            {t('timeHeader')}:{' '}
            {days.map((day) => t(day.toLowerCase())).join(', ')}{' '}
            {t('everyWeek')}, {startTime} - {endTime}
          </p>
          <p>
            {t('location')}: {location}
          </p>
        </div>

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
          {schedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              startTime={schedule.startTime!}
              endTime={schedule.endTime!}
              description={schedule.description!}
              locale={locale}
            />
          ))}
        </div>
      </div>

      {/* Buy Button */}
      <Link
        href={formLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button>{t('reserve-button')}</Button>
      </Link>
    </div>
  )
}

export default ClassDescription
