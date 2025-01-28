'use client'

import { useState, useRef, useEffect } from 'react'
import { Ribbon, ChevronDown } from 'lucide-react'

import { usePathname } from 'next/navigation'

type screenSize = 'mobile' | 'desktop'

interface NavAboutProps {
  title: string
  vision: string
  directors: string
  mode: screenSize
  currentPath?: string
}

const NavAbout: React.FC<NavAboutProps> = ({ 
  title, 
  vision, 
  directors, 
  mode, 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const isActive = pathname.toLowerCase().includes('about')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <div ref={dropdownRef} className="relative">
      <button
        className={classNames(
          'flex items-center gap-x-[5px] transition-all',
          mode === 'desktop'
            ? `whitespace-nowrap text-sm ${
                isActive ? 'text-blue-500 underline' : 'text-[#1B171A] hover:text-blue-500 hover:underline'
              }`
            : `mt-2 h-full w-full rounded-md p-4 text-xl ${
                isActive ? 'text-blue-500 underline' : 'text-slate-200 hover:bg-[#620BC4] hover:text-blue-500 hover:underline'
              }`
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Ribbon className="h-5 w-5" />
        <span>{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={classNames(
          'absolute z-50 min-w-full border border-gray-200 bg-white shadow-lg transition-all',
          mode === 'desktop' ? 'right-0' : 'left-0',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <a href="/about/vision" 
          className={classNames(
            'flex items-center justify-center gap-x-[5px] p-2 transition-all hover:bg-gray-100',
            mode === 'desktop'
              ? 'whitespace-nowrap text-sm text-[#1B171A] hover:text-blue-500'
              : 'text-xl text-slate-200 hover:text-blue-500'
          )}
        >
          {vision}
        </a>
        <div className="border-b border-gray-200" />
        <a href="/about/directors" 
          className={classNames(
            'flex items-center justify-center gap-x-[5px] p-2 transition-all hover:bg-gray-100',
            mode === 'desktop'
              ? 'whitespace-nowrap text-sm text-[#1B171A] hover:text-blue-500'
              : 'text-xl text-slate-200 hover:text-blue-500'
          )}
        >
          {directors}
        </a>
      </div>
    </div>
  )
}

export default NavAbout