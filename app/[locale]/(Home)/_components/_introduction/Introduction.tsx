// Libraries
import initTranslation from '@/app/i18n'

// Components
import IntroCard from './IntroCard'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'

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

  return (
    <div>
      <div className="flex-col-center header-font-white default-gap relative h-[80vh] text-center lg:h-[85vh]">
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
        <h2 className="header-sub my-2 max-w-[90vw] xl:my-4 xl:text-5xl">
          {t('title-small-introduction')}
        </h2>
        <p className="header-text">{t('title-big-introduction')}</p>
      </div>

      <div className="width-max-default mx-auto flex flex-col gap-y-12 p-6 md:p-12 lg:gap-y-16 lg:p-16">
        {introductionData.map((intro) => (
          <IntroCard key={intro.id} locale={locale} {...intro} />
        ))}
      </div>
      <Separator className="mx-auto mt-12 w-2/3 bg-bgColor-brandDark md:w-1/2" />
    </div>
  )
}

export default Introduction
