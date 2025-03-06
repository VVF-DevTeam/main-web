import React from 'react'
import initTranslation from '@/app/i18n'
import Image from 'next/image'
interface EventHeroImageProps {
  locale: string
}
const EventHeroImage = async ({ locale }: EventHeroImageProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden">
      <Image
        src="/bg/tennis-team-bg.jpg"
        alt="event section backround image"
        height={1333}
        width={2000}
        className="relative z-0 h-[70vh] min-w-full object-cover blur-sm brightness-50"
        sizes="100vw"
        priority
      />
      <div className="z-5 absolute flex flex-col items-center justify-center gap-y-12 text-[#fff7f7]">
        <h1 className="text-4xl tracking-wide md:text-5xl lg:text-6xl">
          {t('header-introduction')}
        </h1>
        <p className="max-w-[60vw] text-pretty text-center text-2xl font-semibold tracking-wider md:text-3xl">
          {t('description-introduction')}
        </p>
      </div>
    </div>
  )
}

export default EventHeroImage
