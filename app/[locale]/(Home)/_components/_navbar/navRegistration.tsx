'use client'

// Libraries
import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

// Components
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

// Interfaces
type screenSize = 'mobile' | 'desktop'
interface NavRegistrationProps {
  mode: screenSize
}

// Main Component
const NavRegistration: React.FC<NavRegistrationProps> = ({ mode }) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('homePage')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pathname = usePathname()
  const isActive = pathname.toLowerCase().includes('registration')

  const classNames = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ')
  }

  const handleMouseEnter = () => {
    if (mode !== 'desktop') return
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    if (mode !== 'desktop') return
    closeTimer.current = setTimeout(() => setIsOpen(false), 1000)
  }

  return (
    <div
      ref={dropdownRef}
      className="relative -mr-1 w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={classNames(
          'flex items-center justify-center text-lg transition-all xl:text-xl',
          mode === 'desktop'
            ? `gap-x-[5px] whitespace-nowrap ${
                isActive
                  ? 'text-textColor-brand900'
                  : 'text-textColor hover:text-textColor-brand900 hover:underline'
              }`
            : `mt-2 h-full w-full gap-x-4 rounded-md p-4 ${
                isActive
                  ? 'text-textColor-brand600'
                  : 'px-5 text-slate-200 hover:bg-bgColor-brand900/50'
              }`
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{t('main-navRegistration')}</span>
        <ChevronDown
          className={`lg:h-5 lg:w-5 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={classNames(
          'absolute z-50 mt-2 min-w-full rounded-md border border-gray-200 bg-white shadow-lg transition-all',
          mode === 'desktop' ? 'right-0' : 'left-0',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <Link
          href="/registration/membership"
          className={classNames(
            'flex items-center justify-center p-2 text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand900',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(false)}
        >
          {t('job-navMembership')}
        </Link>
        <div className="border-b border-gray-200" />
        <Link
          href="/registration/jobs"
          className={classNames(
            'flex items-center justify-center p-2 text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand900',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(false)}
        >
          {t('job-navRegistration')}
        </Link>
        <div className="border-b border-gray-200" />
        <Link
          href="/registration/becomeHost"
          className={classNames(
            'flex items-center justify-center p-2 text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand900',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(false)}
        >
          {t('job-navBecomeHost')}
        </Link>
      </div>
    </div>
  )
}

export default NavRegistration
