import React from 'react'
import { navRoutes } from '@/lib/navRoutes'
import NavLink from './navLink'
import { cn } from '@/lib/utils'
import initTranslation from '@/app/i18n'

type screenSize = 'mobile' | 'desktop'
interface NavLinkProps {
  mode: screenSize,
  locale: string
}
const NavLinks = async ({ mode, locale }: NavLinkProps) => {

  const { t } = await initTranslation(locale, ['homePage', 'common']);

  // TODO: Concat navroute and auth routes
  return (
    <div
      className={cn(
        mode === 'desktop'
          ? 'flex h-full w-full items-center gap-x-3 lg:gap-x-6'
          : 'flex h-full w-full flex-col items-center justify-center gap-y-4'
      )}
    >
      {navRoutes.map((route) => (
        <NavLink
          key={route.label}
          label={t(route.label.toLowerCase() + '-navLink')}
          path={route.path}
          logo={route.logo}
          mode={mode}
        />
      ))}
    </div>
  )
}

export default NavLinks
