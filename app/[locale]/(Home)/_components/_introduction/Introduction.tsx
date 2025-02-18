// Components
import IntroCard from './IntroCard'
import initTranslation from '@/app/i18n'
import Image from 'next/image'

// CSS Modules
import headerMainStyles from '@/lib/ui/cssModules/headers/headerMain.module.css'
import cardDefaultStyles from '@/lib/ui/cssModules/cards/cardDefault.module.css'

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
        className={`${headerMainStyles.introFont} flexColCenter relative h-[90vh] gap-y-8`}
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
        <h1 className={`${headerMainStyles.big} max-w-[90vw]`}>
          {t('title-big-introduction')}
        </h1>
        <p
          className={`${headerMainStyles.small}`}
        >
          {t('title-small-introduction')}
        </p>
      </div>

      <div className={`${cardDefaultStyles.main} max-w-[1500px]`}>
        {introductionData.map((intro) => (
          <IntroCard key={intro.id} locale={locale} {...intro} />
        ))}
      </div>
    </div>
  )
}

export default Introduction
