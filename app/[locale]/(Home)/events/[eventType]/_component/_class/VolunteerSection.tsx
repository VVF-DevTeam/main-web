'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ArrowRight, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface VolunteerSectionProps {
  locale: string
  eventKeyName: string
}

export default function VolunteerSection({ locale, eventKeyName }: VolunteerSectionProps) {
  const [isVisible, setIsVisible] = useState(true)
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')

  if (!isVisible) return null

  return (
    <Link 
      href={`/${locale}/registration/jobs?eventKeyName=${eventKeyName}`}
      className="relative flex items-center justify-between gap-4 bg-bgColor-secondary200 rounded-2xl py-3 px-4 hover:bg-bgColor-secondary300 transition-colors group"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center gap-4">
        {/* Icon volunteer */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bgColor-brand600 flex-shrink-0">
          <Heart className="h-4 w-4 text-white fill-white" />
        </div>
        
        {/* Text */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 pb-[2px]">
            {t('want-to-help')}
          </h3>
          <p className="text-xs text-gray-600">
            {t('volunteer-with-us')}
          </p>
        </div>
      </div>

        {/* Arrow Icon - moved to left */}
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0 mr-5" />
        

      {/* Close button - inside on top right */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsVisible(false)
        }}
        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full hover:bg-bgColor-gray300 transition-colors z-10 bg-gray-700"
        aria-label="Close volunteer section"
      >
        <X className="h-3 w-3 text-textColor-white" />
      </button>
    </Link>
  )
}

