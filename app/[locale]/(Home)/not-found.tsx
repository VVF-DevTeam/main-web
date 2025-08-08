import { headers } from 'next/headers'
import i18nConfig from '@/i18nConfig'
import initTranslations from '@/app/i18n'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default async function NotFound() {
  // Get the locale from the URL path via headers (set by middleware)
  const headersList = await headers()
  const pathname = headersList.get('current-path') || ''

  // Extract locale from pathname (e.g., "/en/invalid-path" -> "en")
  const pathSegments = pathname.split('/').filter(Boolean)
  const locale = i18nConfig.locales.includes(pathSegments[0])
    ? pathSegments[0]
    : i18nConfig.defaultLocale
  const { t } = await initTranslations(locale, ['common'])

  return (
    <div className="mx-auto flex flex-col items-center justify-center gap-4 pt-10 text-center text-2xl pb-4">
      <h1 className="text-4xl font-bold">{t('notFound')}</h1>
      <p className="text-lg">{t('notFoundDescription')}</p>
      <Image
        src="https://drive.google.com/thumbnail?id=19tM0WbHYTAMlN_y8MkpYs8ZxoXUMAZYD&sz=w2000"
        alt="Not Found"
        width={450}
        height={450}
        className="object-cover"
      />
      <Link
        href="/"
        className="group flex items-center gap-2 text-blue-500 transition-colors duration-300 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" />
        {t('goHome')}
      </Link>
    </div>
  )
}
