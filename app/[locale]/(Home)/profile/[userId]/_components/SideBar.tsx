'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import MobileSidebar from './MobileSidebar' // Import the new component

export default function Sidebar({
  locale,
  userId,
}: {
  locale: string
  userId: string
}) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'my-profile'

  const sections = {
    'my-profile': t('my-profile'),
    'update-profile': t('update-profile'),
    'change-password': t('change-password'),
    'delete-account': t('delete-account'),
  }

  return (
    <div className="relative w-full bg-bgColor-grayLight p-4 md:w-64 md:p-6">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <h2 className="text-textColor-black mb-4 text-xl font-semibold">
          {t('acc-setting')}
        </h2>

        <ul className="space-y-4">
          {Object.entries(sections).map(([key, label]) => (
            <li key={key}>
              <Link
                href={`/${locale}/profile/${userId}?section=${key}`}
                className={`block w-full rounded-lg px-4 py-2 text-left text-lg transition-colors ${
                  currentSection === key
                    ? 'text-textColor-black bg-white font-medium shadow-sm'
                    : 'text-textColor-black hover:bg-bgColor-white'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Navigation */}
      <MobileSidebar locale={locale} userId={userId} sections={sections} />
    </div>
  )
}
