import React from 'react'
import initTranslation from '@/app/i18n'
import Image from 'next/image'
import Link from 'next/link'

// Components
import { Button } from '@/components/ui/button'

// Interfaces
interface RegisterDoubleSectionProps {
  locale: string
}

const RegisterDoubleSection = async ({
  locale,
}: RegisterDoubleSectionProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-y-5 px-5 pb-10">
      <h2 className="header-main text-center">
        {t('registerDoubleSection-title')}
      </h2>
      <h3 className="text-center">{t('registerDoubleSection-description')}</h3>
      <div className="flex pt-5">
        <div className="group relative h-96 w-1/2">
          <Image
            src="https://drive.google.com/thumbnail?id=1a75ZM7UwXhXp43MjDt6WgYjtyccVWyQU&sz=w1000"
            alt="Membership Benefits 1"
            fill
            className="z-0 object-cover brightness-[0.4] transition-all duration-300 group-hover:z-10 group-hover:scale-x-[1.15] group-hover:scale-y-[1.1]"
            style={{
              clipPath: 'polygon(0% 0, 95.4% 0, 86.4% 100%, 0% 100%)',
              transform: 'scaleX(1.1)',
              transformOrigin: 'left center',
              transition: 'transform 300ms ease, z-index 0ms ease 300ms',
            }}
          />
          {/* Text overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-white transition-all duration-300 group-hover:z-10 group-hover:translate-x-4">
            <h3 className="mb-4 text-xl font-bold drop-shadow-lg md:text-2xl">
              {t('registerDoubleSection-becomeVolunteer')}
            </h3>
            <p className="mb-6 max-w-xs drop-shadow-md sm:text-base md:text-lg">
              {t('registerDoubleSection-becomeVolunteerDescription')}
            </p>
            <Button variant="default" className="px-6 py-2 text-sm font-semibold text-textColor-white md:text-base">
              <Link href="/registration/jobs" rel="noopener noreferrer" target="_blank">{t('learnMore')}</Link>
            </Button> 
          </div>
        </div>
        <div className="group relative h-96 w-1/2 overflow-visible">
          <Image
            src="https://drive.google.com/thumbnail?id=1AqJvPcGUzuZM5pTnLWI_TPR0iZhIu27M&sz=w1000"
            alt="Membership Benefits 1"
            fill
            className="z-0 object-cover brightness-[0.4] transition-all duration-300 group-hover:z-10 group-hover:scale-x-[1.15] group-hover:scale-y-[1.1]"
            style={{
              clipPath: 'polygon(100% 0, 13.6% 0, 4.6% 100%, 100% 100%)',
              transform: 'scaleX(1.1)',
              transformOrigin: 'right center',
              transition: 'transform 300ms ease, z-index 0ms ease 300ms',
            }}
          />
          {/* Text overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-white transition-all duration-300 group-hover:z-10 group-hover:-translate-x-4">
            <h3 className="mb-4 text-xl font-bold drop-shadow-lg md:text-2xl">
              {t('registerDoubleSection-becomeHost')}
            </h3>
            <p className="mb-6 max-w-xs pl-5 drop-shadow-md md:text-lg">
              {t('registerDoubleSection-becomeHostDescription')}
            </p>
            <Button variant="default" className="px-6 py-2 text-sm font-semibold text-textColor-white md:text-base">
              <Link href="/registration/becomeHost" rel="noopener noreferrer" target="_blank">{t('learnMore')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterDoubleSection
