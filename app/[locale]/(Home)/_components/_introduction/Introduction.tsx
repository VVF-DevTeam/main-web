import IntroCard from './IntroCard'
import initTranslation from '@/app/i18n'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'

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

const Introduction = async ({ locale }: IntroductionProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <>
      {/* Section 1: Hero Image */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden">
        <Image
          src={'/bg/guitar-background.jpg'}
          alt="hero section backround image"
          height={1333}
          width={2000}
          className="relative z-0 h-[70vh] min-w-full object-cover blur-sm brightness-50"
          sizes="100vw"
          priority
        />
        <div className="z-5 absolute flex flex-col items-center justify-center gap-y-16 text-[#fff7f7]">
          <h1 className="text-2xl tracking-wide md:text-3xl lg:text-3xl">
            Viet Vibe Foundation
          </h1>
          <p className="max-w-[90%] text-pretty text-center text-4xl font-semibold tracking-wider md:text-7xl lg:max-w-[80%] lg:text-5xl xl:max-w-[900px]">
            {t('title-small-introduction')}
          </p>
          <p className="max-w-[70%] text-xl tracking-wide md:text-2xl lg:text-2xl">
            {t('title-big-introduction')}
          </p>
        </div>
      </div>

      {/* Section 2: Intro Cards */}
      <div className="flex-col-default">
        {introductionData.map((intro) => (
          <IntroCard key={intro.id} locale={locale} {...intro} />
        ))}
      </div>
      <Separator className="mx-auto mt-12 w-1/2 bg-[#7f0000]" />
    </>
  )
}

export default Introduction
