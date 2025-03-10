'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, Menu } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Sidebar({
  locale,
  userId,
}: {
  locale: string
  userId: string
}) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const currentSection = searchParams.get('section') || 'my-profile'
  const [isOpen, setIsOpen] = useState(false)

  const sections = {
    'my-profile': t('my-profile'),
    'update-profile': t('update-profile'),
    'change-password': t('change-password'),
    'delete-account': t('delete-account'),
  }

  return (
    <div className="relative w-full bg-bgColor-grayLight p-4 md:w-64 md:p-6">
      {/* ✅ Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-textColor-black flex w-full items-center justify-between text-lg font-semibold md:hidden"
        aria-label="Toggle Sidebar"
      >
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <span>Menu</span>
        </div>
        <ChevronDown
          className={`text-textColor-black h-5 w-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ✅ Sidebar Menu (Uses `Link` to update searchParams) */}
      <div
        className={`absolute left-0 w-full rounded-lg bg-bgColor-grayLight p-4 shadow-md transition-all duration-300 md:static md:block md:shadow-none ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <h2 className="text-textColor-black mb-4 text-xl font-semibold md:block">
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
    </div>
  )
}
