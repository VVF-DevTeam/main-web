// Libraries
import initTranslation from '@/app/i18n'

// Components
// import IntroCard from './IntroCard'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
// Actions

// const introductionData = [
//   {
//     id: 1,
//     description: 'sport-description-introduction',
//     imageUrl:
//       'https://drive.google.com/thumbnail?id=1JLCsSSkUa9T6_dIksI8L3XWu8K0H6gKz',
//     title: 'sport-header-introduction',
//   },
//   {
//     id: 2,
//     description: 'music-description-introduction',
//     imageUrl:
//       'https://drive.google.com/thumbnail?id=1KZAEFIBNqDXd-HjNB6oLnf6zN6MvCjyj',
//     title: 'music-header-introduction',
//   },
// ]

interface IntroductionProps {
  locale: string
}

// Main Component
const Introduction = async ({ locale }: IntroductionProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div>
      {/* Old hero image */}
      {/* <div className="flex-col-center header-font-white default-gap relative min-h-[60vh] py-5 text-center lg:min-h-[70vh]"> */}
      {/* NextJS Image and Dark Overlay */}
      {/* <div className="dark-overlay"></div>
          <Image
            src="https://drive.google.com/thumbnail?id=1ZREcmGQvqVeJGd5GLlk0FF7vjyYHFpkl"
            alt="Intro image of someone playing a guitar"
            className="next-background"
            fill
            priority
          /> */}

      {/* Titles and Descriptions */}
      {/* <h1 className="text-2xl tracking-wide md:text-3xl">
            Viet Vibe Foundation
          </h1>
          <h2 className="header-sub my-2 max-w-[90vw] leading-normal sm:leading-tight md:leading-normal xl:my-4 xl:text-5xl xl:leading-normal">
            {t('title-small-introduction')}
          </h2>
          <p className="header-text">{t('title-big-introduction')}</p> */}
      {/* </div> */}

      <div className="relative flex w-full flex-col gap-5 px-2 pt-3 md:grid md:grid-cols-2 md:px-4">
        <div className="flex h-full flex-col">
          {/* Hero Singing Image */}
          <div className="hidden md:relative md:flex md:w-full md:justify-end md:pr-[220px] lg:pr-[320px]">
            <Image
              src="https://drive.google.com/thumbnail?id=1ztgM0FwJ-5Yv2qgSTndCekqNHPaB7XyZ"
              alt="Intro image of someone singing"
              width={280}
              height={255}
              className="h-[255px] w-auto max-w-full"
              priority
            />
            <div className="absolute right-[155px] top-[30px] rotate-[10deg] rounded-2xl bg-bgColor-secondary200 px-3 py-[6px]">
              <p className="web-body-regular">Camping</p>
            </div>
            <div className="absolute bottom-0 rotate-[-5deg] rounded-3xl bg-bgColor-brand200 px-6 py-2 md:right-[322px] lg:right-[442px]">
              <p className="web-body-regular">Music</p>
            </div>
          </div>

          {/* Hero Guitar Image */}
          <div className="relative flex w-full justify-end pt-[25px] md:pr-[180px] lg:pr-[220px] pb-[20px] md:pb-[0px]">
            <Image
              src="https://drive.google.com/thumbnail?id=1iwVti25Ac78wbedMIajkNHMoUt2rnZPi"
              alt="Intro image of someone playing a guitar"
              width={223}
              height={176}
              className="h-[176px] w-auto max-w-full"
              priority
            />
            <div className="absolute top-[170px] right-[60px] rotate-[10deg] whitespace-nowrap rounded-3xl bg-bgColor-secondary400 px-6 py-2 md:right-[220px] md:rotate-[-3deg] lg:right-[330px] lg:rotate-[10deg]">
              <p className="web-body-regular">Guitar Lessons</p>
            </div>
            <div className="absolute left-[15px] top-[40px] rotate-[-15deg] rounded-3xl bg-bgColor-secondary200 px-6 py-3 sm:left-[30px] md:hidden">
              <p className="web-body-regular">Camping</p>
            </div>
            <div className="absolute left-[15px] top-[150px] rotate-[10deg] rounded-3xl bg-bgColor-gray100 px-6 py-3 sm:left-[30px] md:hidden">
              <p className="web-body-regular">Music</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-y-5 md:absolute md:left-1/2 md:top-1/2 md:z-[5] md:-translate-x-1/2 md:-translate-y-1/2">
          {/* Header Web_H1 */}
          <h2 className="web_h1 whitespace-nowrap md:max-w-[500px]">
            {t('title-big-introduction')}
          </h2>
          <p className="web-body-regular md:max-w-[510px] pb-[20px]">
            {t('title-small-introduction')}
          </p>

          <Button
            variant={'default'}
            className="web-button-bold h-[52px] w-[260px] text-[18px]"
          >
            <Link href={'/events'}>{t('button-introduction')}</Link>
          </Button>
        </div>

        <div className="flex h-full flex-col">
          <div className="relative flex w-full md:pl-[240px] lg:pl-[350px]">
            {/* Hero Dancing Image */}
            <Image
              src="https://drive.google.com/thumbnail?id=1VE9xFLY1eTykPpKhncvXmTD1erR_4kpH"
              alt="Intro image of someone dancing"
              width={212}
              height={230}
              className="h-[230px] w-auto max-w-full"
              priority
            />
            <div className="absolute left-[40vw] top-[80px] whitespace-nowrap rounded-3xl bg-bgColor-gray100 px-6 py-3 md:py-2 md:left-[200px] md:top-[40px] md:rotate-[-15deg] lg:left-[260px]">
              <p className="web-body-regular">Events</p>
            </div>
            <div className="absolute right-[20px] sm:right-[40px] top-[30px] rotate-[15deg] whitespace-nowrap rounded-3xl bg-bgColor-brand100 px-6 py-3 md:hidden">
              <p className="web-body-regular">Sports</p>
            </div>
            <div className="absolute bottom-0 rotate-[-5deg] whitespace-nowrap rounded-3xl bg-[#FEBC8B] px-6 py-2 md:left-[330px] lg:left-[380px]">
              <p className="web-body-regular">Dance</p>
            </div>
          </div>

          <div className="hidden md:relative md:flex md:w-full md:pl-[135px] md:pt-[25px]">
            {/* Hero Tennis Image */}
            <Image
              src="https://drive.google.com/thumbnail?id=1Wf4CwIBeAwbV7RbZx22lkqxC3nzd1QT8"
              alt="Intro image of someones playing a tennis"
              width={246}
              height={246}
              className="h-[246px] w-auto max-w-full"
              priority
            />

            <div className="absolute md:bottom-[110px] lg:bottom-[90px] md:left-[320px] lg:left-[350px] rotate-[5deg] whitespace-nowrap rounded-3xl bg-bgColor-brand100 px-6 py-2">
              <p className="web-body-regular">Sports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Cards (old) */}
      {/* <div className="width-max-default mx-auto flex flex-col gap-y-12 p-6 md:p-12 md:pt-8 lg:gap-y-16 lg:p-16 lg:pt-8">
          {introductionData.map((intro) => (
            <IntroCard key={intro.id} locale={locale} {...intro} />
          ))}
        </div> */}

      {/* Separator (old)*/}
      {/* <div className="mx-auto mt-12 w-2/3 border-b border-bgColor-brand900 md:w-1/2"></div> */}
    </div>
  )
}

export default Introduction
