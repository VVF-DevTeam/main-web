// Libraries
import initTranslation from '@/app/i18n'

// Components
import IntroCard from './IntroCard'
import Image from 'next/image'
import Link from 'next/link'

// Actions
import { getClosestFutureEvent } from '@/lib/actions/event/getClosestEvent'

const introductionData = [
  {
    id: 1,
    description: 'sport-description-introduction',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1JLCsSSkUa9T6_dIksI8L3XWu8K0H6gKz&sz=w1000',
    title: 'sport-header-introduction',
  },
  {
    id: 2,
    description: 'music-description-introduction',
    imageUrl:
      'https://drive.google.com/thumbnail?id=1KZAEFIBNqDXd-HjNB6oLnf6zN6MvCjyj&sz=w1000',
    title: 'music-header-introduction',
  },
]

interface IntroductionProps {
  locale: string
}

// Main Component
const Introduction = async ({ locale }: IntroductionProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  // Get the closest future event
  const closestEvent = await getClosestFutureEvent()

  return (
    <div>
      <div className="flex-col-center header-font-white default-gap relative min-h-[60vh] py-5 text-center lg:min-h-[70vh]">
        {/* NextJS Image and Dark Overlay */}
        <div className="dark-overlay"></div>
        <Image
          src="https://drive.google.com/thumbnail?id=1ZREcmGQvqVeJGd5GLlk0FF7vjyYHFpkl&sz=w2000"
          alt="Intro image of someone playing a guitar"
          className="next-background"
          fill
          priority
        />

        {/* Titles and Descriptions */}
        <h1 className="text-2xl tracking-wide md:text-3xl">
          Viet Vibe Foundation
        </h1>
        <h2 className="header-sub my-2 max-w-[90vw] leading-normal sm:leading-tight md:leading-normal xl:my-4 xl:text-5xl xl:leading-normal">
          {t('title-small-introduction')}
        </h2>
        <p className="header-text">{t('title-big-introduction')}</p>
      </div>

      {/* Text for latest events - only show if there's a future event */}
      {closestEvent && (
        <div className="flex w-full justify-center">
          <div className="max-w-7xl rounded-lg p-4 text-center">
            <p className="overflow-hidden text-ellipsis pt-4 text-xl leading-relaxed tracking-wide sm:whitespace-normal md:text-2xl md:leading-relaxed lg:text-2xl lg:leading-relaxed dark:text-white">
              <Image
                src="https://drive.google.com/thumbnail?id=1KOA45MZfxUJyqGmNMO7x00U-bYXHJmaU&sz=w1000"
                alt="Penguin icon"
                width={50}
                height={50}
                className="mr-2 inline-block align-middle"
              />
              {t('event-hot-text')} <strong>{closestEvent.title}</strong>,{' '}
              {t('event-happening-on')}{' '}
              {closestEvent.startDate &&
                new Date(closestEvent.startDate).toLocaleDateString(locale)}
              {closestEvent.startTime &&
                ` ${t('event-at')} ${closestEvent.startTime}`}
              {/* {closestEvent.endDate &&
                 new Date(closestEvent.endDate).toLocaleDateString(locale)}
               {closestEvent.endTime && ` at ${closestEvent.endTime}`}  */}{' '}
              - {t('event-few-spots-left')}{' '}
              <Link
                href={`/${locale}/events/${closestEvent.eventType.toLowerCase()}/${closestEvent.keyName}`}
                className="group inline-flex items-center gap-1 font-semibold underline transition-colors hover:text-bgColor-brand"
              >
                {t('event-dont-miss-chance')}
                <Image
                  src="https://drive.google.com/thumbnail?id=1KOA45MZfxUJyqGmNMO7x00U-bYXHJmaU&sz=w1000"
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

      <div className="width-max-default mx-auto flex flex-col gap-y-12 p-6 md:p-12 md:pt-8 lg:gap-y-16 lg:p-16 lg:pt-8">
        {introductionData.map((intro) => (
          <IntroCard key={intro.id} locale={locale} {...intro} />
        ))}
      </div>

      {/* Separator */}
      <div className="mx-auto mt-12 w-2/3 border-b border-bgColor-brand md:w-1/2"></div>
    </div>
  )
}

export default Introduction
