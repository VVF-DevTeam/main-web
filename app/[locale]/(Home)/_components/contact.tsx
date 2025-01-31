'use client'

import React from 'react'
import { Contact2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Contact = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()

  return (
    <div className="h-[60vh] w-full bg-[#EFB9A2]/20">
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-14 lg:gap-y-20">
        <div className="flex flex-col items-center justify-center gap-y-6">
          <h2 className="cursor-default text-center text-3xl font-bold tracking-wide text-[#3d3a3a] transition-all duration-100 ease-out md:text-4xl lg:text-5xl">
            {t('getInTouch-contact')}
          </h2>
        </div>
        <a
          href="https://www.instagram.com/vietvibe.foundation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border-b-2 bg-[#C54B3E] px-10 py-6 font-bold tracking-wide shadow-md hover:bg-[#C54B3E]/90"
        >
          <span className="mx-auto flex items-center gap-x-4 text-[#fff7f7]">
            {t('chat-contact')}
            <Contact2 className="h-7 w-7" />
          </span>
        </a>
      </div>
    </div>
  );
};

export default Contact;
