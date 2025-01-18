'use client'

import React from 'react'
import { Contact2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const Contact = () => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()

  return (
    <div className="h-[50vh] w-full bg-[#1B171A]/50">
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-14 lg:gap-y-20">
        <div className="flex flex-col items-center justify-center gap-y-6">
          <h2 className="cursor-default text-center text-3xl font-bold tracking-wide text-[#EFB9A2] transition-all duration-100 ease-out hover:text-[#EFB9A2]/70 md:text-4xl lg:text-5xl">
            {t('getInTouch-contact')}
          </h2>
        </div>
        <a
          href="https://www.instagram.com/vietvibe.foundation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border-b-2 border-[#EFB9A2] bg-[#1B171A] px-14 py-6 font-bold tracking-wide shadow-md hover:border-[#EFB9A2]/80 hover:bg-[#1B171A]/90 hover:text-white"
        >
          <span className="mx-auto flex items-center gap-x-4 text-[#EFB9A2]">
            {t('chat-contact')}
            <Contact2 className="h-7 w-7" />
          </span>
        </a>
      </div>
    </div>
  );
};

export default Contact;
