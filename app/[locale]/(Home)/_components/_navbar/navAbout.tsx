'use client'

// Libraries
import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Components
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

// Interfaces
type screenSize = 'mobile' | 'desktop'
interface NavAboutProps {
  title: string
  vision: string
  directors: string
  founders: string
  mode: screenSize
  currentPath?: string
}

// Main Component
const NavAbout: React.FC<NavAboutProps> = ({
  title,
  vision,
  directors,
  founders,
  mode,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pathname = usePathname()
  const isActive = pathname.toLowerCase().includes('about')

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
    closeTimer.current = setTimeout(() => setIsOpen(false), 200)
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
                  ? 'font-semibold'
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
        <span>{title}</span>
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
          href="/about/vision"
          className={classNames(
            'flex items-center justify-center p-2 text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand900',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(false)}
        >
          {vision}
        </Link>
        <div className="border-b border-gray-200" />
        <Link
          href="/about/members"
          className={classNames(
            'flex items-center justify-center p-2 text-center text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand900',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(false)}
        >
          {directors}
        </Link>
        <div className="border-b border-gray-200" />
        <Link
          href="/about/founders"
          className={classNames(
            'flex items-center justify-center p-2 text-center text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand900',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(false)}
        >
          {founders}
        </Link>
      </div>
    </div>
  )
}

export default NavAbout
