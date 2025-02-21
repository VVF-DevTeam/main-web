// Libraries
import initTranslation from '@/app/i18n'

// Components
import IntroCard from './IntroCard'
import Image from 'next/image'

// CSS & CSS Modules
import cardIntroStyles from '@/lib/ui/cssModules/introduction/cardIntro.module.css'

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

const Introduction = async ({ locale }: IntroductionProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div>
      <div
        className={`headerFontWhite flexColCenter defaultGap relative h-[90vh]`}
      >
        {/* NextJS Image and Dark Overlay */}
        <div className={`darkOverlay`}></div>
        <Image
          src="https://drive.google.com/thumbnail?id=1ZREcmGQvqVeJGd5GLlk0FF7vjyYHFpkl&sz=w2000"
          alt="Intro"
          className={`nextBG`}
          fill
          priority
        />

        {/* Titles and Descriptions */}
        <h1 className={`text-2xl tracking-wide md:text-3xl`}>
          Viet Vibe Foundation
        </h1>
        <h1 className={`headerBig max-w-[90vw]`}>
          {t('title-big-introduction')}
        </h1>
        <p className={`headerText`}>
          {t('title-small-introduction')}
        </p>
      </div>

      <div className={`${cardIntroStyles.main} max-w-[1500px]`}>
        {introductionData.map((intro) => (
          <IntroCard key={intro.id} locale={locale} {...intro} />
        ))}
      </div>
    </div>
  )
}

export default Introduction
