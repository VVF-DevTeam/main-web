// Libraries
import initTranslation from '@/app/i18n'
import React from 'react'

// Components
import { Contact2 } from 'lucide-react'
import Link from 'next/link'

// Interfaces
interface ContactProps {
  locale: string
}

// Main Component
const Contact = async ({ locale }: ContactProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <div className="h-[30vh] w-full bg-bgColor-brandLighter">
      <div className="flex-col-center h-full w-full gap-y-14 lg:gap-y-20">
        <h2 className="header-sub cursor-default text-center text-bgColor-blackLight lg:text-5xl">
          {t('header-contactUs')}
        </h2>
        <Link
          href="https://www.instagram.com/vietvibe.foundation"
          target="_blank"
          aria-label={t('button-contactUs') as string}
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border-b-2 bg-bgColor-brand px-10 py-6 font-bold tracking-wide shadow-md hover:bg-bgColor-brand/90"
        >
          <span className="mx-auto flex items-center gap-x-4 text-textColor-white">
            {t('button-contactUs')}
            <Contact2 className="h-7 w-7" />
          </span>
        </Link>
      </div>
    </div>
  )
}

export default Contact
