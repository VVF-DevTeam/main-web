'use client'

// Libraries
import React from 'react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

// Components
import Link from 'next/link'
// import { Home, CalendarDays, Newspaper, LucideIcon, Ribbon } from 'lucide-react'

//Interfaces
// const navLogos: Record<string, LucideIcon> = {
//   home: Home,
//   events: CalendarDays,
//   posts: Newspaper,
//   about: Ribbon,
// }

type screenSize = 'mobile' | 'desktop'
interface NavLinkProps {
  label: string
  path: string
  logo: string
  mode: screenSize
}

// Main Component
const NavLink = ({ label, path, logo, mode }: NavLinkProps) => {
  console.log(logo)
  // const Icon = navLogos[logo]
  const pathname = usePathname()
  const isActive =
    path === '/' 
      ? pathname === '/' || pathname.split('/').length <= 2
      : pathname.toLowerCase().includes(path.toLowerCase())

  // css variables
  const baseClasses =
    'flex-center whitespace-nowrap transition-all tracking-wide'
  const inactiveColor =
    mode === 'desktop'
      ? 'text-textColor hover:text-textColor-brand hover:underline'
      : 'text-textColor-white hover:bg-bgColor-brand'
  const layoutClasses =
    mode === 'desktop'
      ? 'gap-x-[5px] text-xl'
      : 'mt-2 h-full w-full gap-x-4 rounded-md p-4 text-xl'

  return (
    <Link
      href={path}
      className={cn(
        baseClasses,
        layoutClasses,
        isActive ? mode === 'desktop' ? 'font-semibold' : 'text-textColor-brandLight' : inactiveColor
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* <Icon className="h-5 w-5" aria-hidden="true" /> */}
      <span>{label}</span>
    </Link>
  )
}

export default NavLink
