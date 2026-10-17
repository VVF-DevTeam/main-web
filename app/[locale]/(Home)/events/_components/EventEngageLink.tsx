import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import initTranslation from '@/app/i18n'

interface EventEngageLinkProps {
  locale: string
  eventType: string
  eventKeyName: string
  variant?: 'concert' | 'class'
}

export default async function EventEngageLink({
  locale,
  eventType,
  eventKeyName,
  variant = 'class',
}: EventEngageLinkProps) {
  const { t } = await initTranslation(locale, ['event'])

  const isConcert = variant === 'concert'
  const bgClasses = isConcert
    ? 'bg-white hover:bg-gray-50'
    : 'bg-bgColor-secondary200 hover:bg-bgColor-secondary300'

  return (
    <Link
      href={`/${locale}/events/${eventType.toLowerCase()}/${eventKeyName}/engage`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg group ${bgClasses}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bgColor-brand600">
          <Sparkles
            className={`h-4 w-4 ${isConcert ? 'text-textColor-secondary200' : 'text-white'}`}
          />
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {t('engage-cta')}
        </span>
      </div>
      <ArrowRight
        className="h-5 w-5 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-gray-600"
      />
    </Link>
  )
}
