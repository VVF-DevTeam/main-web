'use client'

// Libraries
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Components
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

// Interfaces
type screenSize = 'mobile' | 'desktop'

interface NavSupportProps {
  mode: screenSize
}

// Main Component
const NavSupport: React.FC<NavSupportProps> = ({ mode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const isActive = pathname.toLowerCase().includes('support')

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
                  : 'px-5 text-slate-200 hover:bg-bgColor-brand900'
              }`
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Support Us</span>
        <ChevronDown
          className={`lg:h-6 lg:w-6 h-5 w-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
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
          href="#"
          className={classNames(
            'flex items-center justify-center p-2 text-textColor transition-all hover:rounded-md hover:bg-gray-100 hover:text-textColor-brand900',
            mode === 'desktop' ? 'whitespace-nowrap text-sm' : 'text-xl'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          Shops
        </Link>
      </div>
    </div>
  )
}

export default NavSupport


