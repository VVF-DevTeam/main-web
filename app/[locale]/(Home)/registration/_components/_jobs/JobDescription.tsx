// Libraries
import React from 'react'
import initTranslation from '@/app/i18n'
import Link from 'next/link'

// Components
import TextPreview from '@/app/[locale]/components/TextPreview'
import { Button } from '@/components/ui/button'

// INterfaces & Types
interface JobDescriptionProps {
  description: string
  startDate: Date
  endDate: Date
  location: string
  locale: string
}

const JobDescription = async ({
  description,
  startDate,
  endDate,
  location,
  locale,
}: JobDescriptionProps) => {
  const { t } = await initTranslation(locale, ['job', 'common'])

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col items-start gap-y-8 p-6 md:p-12 lg:gap-y-8 lg:p-16">
      {/* Time and Location */}
      <div className="grid w-full justify-between gap-x-4 gap-y-4 md:flex">
        <div className="flex flex-col gap-y-2">
          <h1 className="mb-2 text-xl font-bold md:text-3xl lg:text-4xl">
            {t('headerInfo')}
          </h1>
          <p>
            {t('location')}: {location}
          </p>
          <p>
            {t('startDate')}:{' '}
            {startDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
          <p>
            {t('endDate')}:{' '}
            {endDate.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        </div>

        {/* <div>
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location}`}
            title="VVF Beginner Guitar Lesson"
            width="300"
            height="250"
            allowFullScreen
          ></iframe>
        </div> */}
      </div>

      {/* Event Description */}
      <div>
        <h1 className="mb-4 text-xl font-bold md:text-3xl lg:text-4xl">
          {t('headerDescription')}
        </h1>

        <div className="mt-4 w-full text-pretty">
          <TextPreview value={description} />
        </div>
        {/* <p className="mt-2 text-muted-foreground">
          (To become a VVF member, please refer to the registration form using
          the reserve button below)
        </p> */}
      </div>

      {/* Apply Button */}
      <Link href="/" target="_blank" rel="noopener noreferrer">
        <Button>{t('apply-button')}</Button>
      </Link>
    </div>
  )
}

export default JobDescription
