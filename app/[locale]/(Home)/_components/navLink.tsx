'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Home, CalendarDays, Newspaper, LucideIcon, Ribbon } from 'lucide-react'
import { usePathname } from 'next/navigation'

const navLogos: Record<string, LucideIcon> = {
  home: Home,
  events: CalendarDays,
  posts: Newspaper,
  about: Ribbon,
}

type screenSize = 'mobile' | 'desktop'

interface NavLinkProps {
  label: string
  path: string
  logo: string
  mode: screenSize
}

const NavLink: React.FC<NavLinkProps> = ({ label, path, logo, mode }) => {
  const Icon = navLogos[logo]
  const pathname = usePathname()

  const isActive =
    pathname.toLowerCase().includes(label.toLowerCase()) ||
    (label.toLowerCase() === 'home' && pathname.split('/').length <= 2)

  return (
    <Link
      href={path}
      className={cn(
        mode === 'desktop'
          ? `flex items-center justify-center gap-x-[5px] whitespace-nowrap text-sm font-semibold tracking-wide transition-all ${isActive ? 'text-[#C54B3E]' : 'text-[#212121] hover:text-[#C54B3E] hover:underline'}`
          : `mt-2 flex h-full w-full items-center justify-center gap-x-4 whitespace-nowrap rounded-md p-4 text-xl font-semibold transition-all ${isActive ? 'text-[#C54B3E]' : 'text-slate-200 hover:bg-[#620BC4]/40'}`
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}

export default NavLink
