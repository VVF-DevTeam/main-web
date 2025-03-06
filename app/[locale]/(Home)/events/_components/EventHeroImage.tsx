// Libraries
import React from 'react'
import initTranslation from '@/app/i18n'

// Components
import Image from 'next/image'

// Interfaces
interface EventHeroImageProps {
  locale: string
}

// Main Component
const EventHeroImage = async ({ locale }: EventHeroImageProps) => {
  const { t } = await initTranslation(locale, ['event', 'common'])
  return (
    <div className="flex-col-center header-font-white default-gap relative h-[70vh] p-6 text-center">
      {/* NextJS Image and Dark Overlay */}
      <div className="dark-overlay"></div>
      <Image
        src="https://drive.google.com/thumbnail?id=13ci_qVojwKNcZlAAfp5ovVMTiLAbymVj&sz=w2000"
        alt="Event List Background"
        className="next-background object-top"
        fill
        priority
      />

      {/* Titles and Descriptions */}
      <h2 className="header-main">{t('header-introduction')}</h2>
      <span className="header-text">{t('description-introduction')}</span>
    </div>
  )
}

export default EventHeroImage
