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
    (label.toLowerCase() === 'home' && pathname.split('/').length <=  2)

  // css variables
  const baseClasses =
    'flex-center whitespace-nowrap font-semibold transition-all tracking-wide'
  const inactiveColor =
    mode === 'desktop'
      ? 'text-textColor hover:text-textColor-brand hover:underline'
      : 'text-textColor-white hover:bg-bgColor-brand'
  const layoutClasses =
    mode === 'desktop'
      ? 'gap-x-[5px] text-sm'
      : 'mt-2 h-full w-full gap-x-4 rounded-md p-4 text-xl'

  return (
    <Link
      href={path}
      className={cn(
        baseClasses,
        layoutClasses,
        isActive ? 'text-textColor-brand' : inactiveColor
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  )
}

export default NavLink
