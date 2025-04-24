'use client'

// Libraries
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Components
import { Ribbon, ChevronDown } from 'lucide-react'
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

  const pathname = usePathname()
  const isActive = pathname.toLowerCase().includes('about')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const classNames = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <div ref={dropdownRef} className="relative -mr-1 w-full">
      <button
        className={classNames(
          'flex items-center justify-center gap-x-[5px] font-semibold transition-all',
          mode === 'desktop'
            ? `whitespace-nowrap text-sm ${
                isActive
                  ? 'text-textColor-brand'
                  : 'text-textColor hover:text-textColor-brand hover:underline'
              }`
            : `mt-2 h-full w-full rounded-md p-4 text-xl ${
                isActive
                  ? 'text-textColor-brand'
                  : 'px-5 text-slate-200 hover:bg-bgColor-brand'
              }`
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Ribbon className="h-5 w-5" />
        <span>{title}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
            'flex items-center justify-center p-2 text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {vision}
        </Link>
        <div className="border-b border-gray-200" />
        <Link
          href="/about/directors"
          className={classNames(
            'flex items-center justify-center p-2 text-center text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {directors}
        </Link>

        <div className="border-b border-gray-200" />
        <Link
          href="/about/founders"
          className={classNames(
            'flex items-center justify-center p-2 text-center text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {founders}
        </Link>
      </div>
    </div>
  )
}

export default NavAbout
