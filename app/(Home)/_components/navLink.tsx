'use client'
import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Home, CalendarDays, LucideIcon } from 'lucide-react'

const navLogos: Record<string, LucideIcon> = {
  home: Home,
  events: CalendarDays,
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
  return (
    <Link
      href={path}
      className={cn(
        mode === 'desktop'
          ? 'flex items-center justify-center gap-x-2 text-[#1B171A] transition-all hover:text-[#1B171A]/70'
          : 'mt-2 flex h-full w-full items-center justify-center gap-x-4 rounded-md p-4 text-xl text-slate-200 transition-all hover:bg-[#620BC4] hover:text-[#EFB9A2]'
      )}
    >
      <Icon className="h-6 w-6" />
      <span>{label}</span>
    </Link>
  )
}

export default NavLink
