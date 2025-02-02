import IntroCard from './IntroCard'
import initTranslation from '@/app/i18n'

const introductionData = [
  {
    id: 1,
    description: 'sport-description-introduction',
    imageUrl: '/bg/tennisInstruction-home.jpg',
    title: 'sport-header-introduction',
  },
  {
    id: 2,
    description: 'music-description-introduction',
    imageUrl: '/bg/pianoInstruction-home.jpg',
    title: 'music-header-introduction',
  },
]

interface IntroductionProps {
  locale: string
}

const Introduction = async({locale}:IntroductionProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="bg-white">
      <div className="blur-xs flex h-[90vh] flex-col items-center justify-center gap-y-8 bg-[#3a3635] bg-[url(/bg/guitar-background.jpg)] bg-cover bg-no-repeat text-center bg-blend-overlay">
        <h1 className="font-[Poppins] text-2xl tracking-wide text-[#fff7f7] md:text-3xl lg:text-3xl">
          Viet Vibe Foundation
        </h1>
        <h1 className="max-w-[90vw] font-[Poppins] text-4xl font-semibold leading-[3rem] tracking-wider text-[#fff7f7] md:max-w-[80vw] md:text-5xl md:leading-[4rem] lg:max-w-[70vw]">
          {t('title-small-introduction')}
        </h1>
        <p className="max-w-[80vw] font-[Poppins] text-xl tracking-wide text-[#fff7f7] md:max-w-[70vw] md:text-2xl lg:max-w-[60vw] lg:text-2xl">
        {t('title-big-introduction')}
        </p>
      </div>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-y-20 p-6 md:p-12 lg:gap-y-24 lg:p-16">
        {introductionData.map((intro) => (
          <IntroCard key={intro.id} locale={locale} {...intro} />
        ))}
      </div>
    </div>
  )
}

export default Introduction
