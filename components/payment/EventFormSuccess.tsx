'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import '@/lib/ui/css/lineAnimation.css'

const FORM_SUCCESS_IMAGE =
  'https://drive.google.com/thumbnail?id=1rq8yi8jxSDNPSkzUoh4__dsuCrhz1DnR'

interface EventFormSuccessProps {
  title: string
}

const EventFormSuccess = ({ title }: EventFormSuccessProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-neutral-900">
      <div className="relative flex w-full max-w-md justify-center overflow-hidden rounded-2xl">
        <Image
          src={FORM_SUCCESS_IMAGE}
          alt="Form submission success"
          width={1200}
          height={900}
          className="mx-auto w-[400px] object-contain"
          sizes="(min-width: 768px) 24rem, 80vw"
          priority
        />
        <div className="absolute inset-0 mt-32 flex flex-col items-center justify-center gap-4">
          <svg
            className="h-20 w-20 text-green-500"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="26"
              cy="26"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="stroke-current"
            />
            <path
              d="M14 27l7 7 17-17"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="checkmark-path"
            />
          </svg>

          <h1 className="mb-2 text-2xl font-bold text-green-600">
            {t('eventFormSuccess-header')}
          </h1>
        </div>
      </div>

      <p className="max-w-xl whitespace-pre-line text-lg text-neutral-700 dark:text-neutral-300">
        {t('eventFormSuccess-text')} <strong>{title}</strong>
        {'\n'}
        {t('eventFormSuccess-closing')}
      </p>
    </div>
  )
}

export default EventFormSuccess
