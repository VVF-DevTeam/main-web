import React from 'react'
import { navRoutes } from '@/lib/navRoutes'
import NavLink from './navLink'
import { cn } from '@/lib/utils'

type screenSize = 'mobile' | 'desktop'
interface NavLinkProps {
  mode: screenSize
}
const NavLinks = ({ mode }: NavLinkProps) => {
  return (
    <div
      className={cn(
        mode === 'desktop'
          ? 'flex h-full w-full items-center gap-x-4'
          : 'flex h-full w-full flex-col items-center justify-center gap-y-4'
      )}
    >
      {navRoutes.map((route) => (
        <NavLink
          key={route.label}
          label={route.label}
          path={route.path}
          logo={route.logo}
          mode={mode}
        />
      ))}
    </div>
  )
}

export default NavLinks
