// Libraries
import React from 'react'
import { navRoutes } from '@/lib/navRoutes'
import { cn } from '@/lib/utils'
import initTranslation from '@/app/i18n'
import { auth } from '@/auth'

// Components
import NavLink from './navLink'
import AuthButtons from './authButtons'
import NavAbout from './navAbout'

// Interfaces
type screenSize = 'mobile' | 'desktop'
interface NavLinkProps {
  mode: screenSize
  locale: string
}

// Main Component
const NavLinks = async ({ mode, locale }: NavLinkProps) => {
  const session = await auth()
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  // TODO: Concat navroute and auth routes
  return (
    <div
      className={cn(
        mode === 'desktop'
          ? 'flex-center h-full w-full gap-x-3 lg:gap-x-6'
          : 'flex-col-center h-full w-full gap-y-4'
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

      {/* TODO: Fix CSS for them */}
      <NavAbout
        title={t('about-navLink')}
        vision={t('vision-navLink')}
        directors={t('directors-navLink')}
        mode={mode}
      />
      <AuthButtons userExists={!!session?.user} mode={mode} />
    </div>
  )
}

export default NavLinks
