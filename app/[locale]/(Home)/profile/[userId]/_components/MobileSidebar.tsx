'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function MobileSidebar({
  locale,
  userId,
  sections,
}: {
  locale: string
  userId: string
  sections: { [key: string]: string }
}) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="block md:hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-textColor-black flex w-full items-center justify-between text-lg font-semibold"
        aria-label="Toggle Sidebar"
      >
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <span>{t('acc-setting')}</span>
        </div>
        <ChevronDown
          className={`text-textColor-black h-5 w-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation() // Prevents click from propagating to button
            setIsOpen(!isOpen)
          }}
        />
      </button>

      {/* Sidebar Menu */}
      {isOpen && (
        <div className="mt-2 rounded-lg bg-bgColor-gray300 p-4 shadow-md">
          <ul className="space-y-4">
            {Object.entries(sections).map(([key, label]) => (
              <li key={key}>
                <Link
                  href={`/${locale}/profile/${userId}?section=${key}`}
                  className="text-textColor-black hover:bg-bgColor-white block w-full rounded-lg px-4 py-2 text-left text-lg transition-colors"
                  onClick={() => setIsOpen(false)} // Close menu on link click
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
