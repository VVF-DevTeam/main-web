'use client'

import React from 'react'
import { Contact2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Contact = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()

  return (
    <div className="h-[60vh] w-full bg-bgColor-brandLighter">
      <div className="flex-col-center h-full w-full gap-y-14 lg:gap-y-20">
        <h2 className="header-sub cursor-default text-center lg:text-5xl">
          {t('header-contactUs')}
        </h2>
        <a
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
        </a>
      </div>
    </div>
  );
};

export default Contact;
