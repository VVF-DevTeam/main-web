// Libraries
import React from 'react'
import initTranslation from '@/app/i18n'
import { navRoutes } from '@/lib/navRoutes'

// Components
import Link from 'next/link'
import { Separator } from '@radix-ui/react-separator'
import { SiFacebook, SiInstagram } from 'react-icons/si' // Import Simple Icons

// Main Component
const Footer = async ({ locale }: { locale: string }) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])

  return (
    <footer className="bg-bgColor-black py-6 sm:px-12 md:px-16 lg:px-24 text-slate-300">
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4">
        {/* Column 1 */}
        <div className="pl-6">
          <h5 className="text-xl text-textColor-white">
            {t('pageHeader-footer').toUpperCase()}
          </h5>
          <Separator className="h-[2px] w-[50px] bg-slate-700" />
          <div className="mt-4 flex flex-col gap-y-2">
            {navRoutes.map((route, index) => (
              <Link
                key={index}
                href={route.path}
                className="hover:text-textColor-brandLight hover:underline"
              >
                {t(route.label.toLowerCase() + '-footer')}
              </Link>
            ))}
          </div>
        </div>
        {/* Column 2 */}
        <div>
          <div className="h-full w-full">
            <div className="px-6">
              <h5 className="text-xl text-textColor-white">
                {t('contactUs-footer').toUpperCase()}
              </h5>
              <Separator className="h-[2px] w-[120px] bg-slate-700" />
              <div className="mt-4 flex flex-col gap-y-2 text-sm">
                {/* <p className="text-slate-500">
                    <span className="text-slate-300">
                      {t('phoneNumber-footer')}
                    </span>
                  </p> */}
                <p>
                  <span>{t('email-footer')}</span>
                </p>
                <p>
                  <span>{t('address-footer')}</span>
                </p>
                {/* Social Media Links */}
                <div className="mt-4 flex space-x-4">
                  <a
                    href="https://www.facebook.com/profile.php?id=61570910920072"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook Page"
                    className="hover:text-textColor-brandLight"
                  >
                    <SiFacebook className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.instagram.com/vietvibe.foundation"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Page"
                    className="hover:text-textColor-brandLight"
                  >
                    <SiInstagram className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
