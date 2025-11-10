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
    <div className="h-[230px] lg:h-[280px] w-full bg-bgColor-brand600">
      <div className="flex-col-center h-full w-full gap-y-12 lg:gap-y-16">
        <h2 className="header-sub cursor-default text-center text-textColor-black lg:text-5xl pt-2">
          {t('header-contactUs')}
        </h2>
        <Link
          href="https://www.instagram.com/vietvibe.foundation"
          target="_blank"
          aria-label={t('button-contactUs') as string}
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border-b-2 bg-bgColor-brand900 px-10 py-6 font-bold tracking-wide shadow-md hover:bg-bgColor-brand900/90 mb-2"
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
