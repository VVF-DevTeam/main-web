'use client'

// Libraries
import React from 'react'
import { useTranslation } from 'react-i18next'
import { navRoutes } from '@/lib/navRoutes'
import { cn } from '@/lib/utils'

// Components
import NavLink from './navLink'
import AuthButtons from './authButtons'
import NavAbout from './navAbout'
import NavRegistration from './navRegistration'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'

// Interfaces
type screenSize = 'mobile' | 'desktop'
interface NavLinkProps {
  mode: screenSize
}

// Main Component
const NavLinks = ({ mode }: NavLinkProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(['homePage', 'common'])

  // TODO: Concat navroute and auth routes
  return (
    <div
      className={cn(
        mode === 'desktop'
          ? 'flex-center h-full w-full gap-x-4 md:gap-x-8 lg:gap-x-[2vw] xl:gap-x-[4vw]'
          : 'flex-col-center h-full w-full gap-y-4'
      )}
    >
      {navRoutes.map((route) => (
        <NavLink
          key={route.label}
          label={t(route.label.toLowerCase() + '-navLink')}
          path={route.path}
          // logo={route.logo}
          mode={mode}
        />
      ))}

      <NavRegistration mode={mode} />

      <NavAbout
        title={t('about-navLink')}
        vision={t('vision-navLink')}
        directors={t('directors-navLink')}
        founders={t('founders-navLink')}
        mode={mode}
      />

      <AuthButtons mode={mode} />

      {/* Mobile App Links */}
      {mode === 'mobile' && (
        <div className="flex-between gap-x-2 text-textColor-white">
          {/* Android App Link */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 hover:text-textColor-brand600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label="Download Android app"
                >
                  <Link
                    className="flex items-end gap-x-1"
                    href="https://play.google.com/store/apps/details?id=com.vvf_mobile"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M17.6 9.48l1.43-2.49a.5.5 0 1 0-.87-.5l-1.45 2.52A7.02 7.02 0 0 0 6.4 9.48L4.95 7a.5.5 0 1 0-.87.5l1.43 2.49A6.98 6.98 0 0 0 3 15.5V17a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h6v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-1.5a6.98 6.98 0 0 0-1.4-6.02zM7.5 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm9 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                    </svg>
                    <span className="text-xs">Android</span>
                  </Link>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-bgColor-black">
                <p className="text-sm text-textColor-brand600">
                  Download Android App
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-textColor-white">|</span>

          {/* iOS App Link */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-end gap-x-1 rounded-md p-1 hover:text-textColor-brand600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label="Download iOS app"
                >
                  <Link
                    className="flex items-end gap-x-1"
                    href="https://apps.apple.com/app/vietvibe/id6753900000"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <span className="text-xs">iOS</span>
                  </Link>
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-bgColor-black">
                <p className="text-sm text-textColor-brand600">
                  Download iOS App
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}

export default NavLinks
