import React from 'react'
import MobileSidebar from './mobileSidebar'
import NavLinks from './navLinks'
import { User2 } from 'lucide-react'
import CompanyLogo from '@/app/[locale]/components/CustomIcon'
import { auth } from '@/auth'
import Link from 'next/link'

const Navbar = async ({ locale }: { locale: string }) => {
  const session = await auth()

  return (
    <nav className="h-[110px] w-full bg-[#d2d0d0] bg-[url(/bg/skating-bg-blur.jpg)] bg-cover bg-no-repeat p-6 bg-blend-overlay shadow-md bg-center">
      <div className="flex h-full w-full items-center justify-between">
        <div className="flex h-full w-full items-center gap-x-4">
          <CompanyLogo />

          {/* User Button */}
          {session?.user?.id && (
            <Link
              className="-ml-10 flex items-center justify-center gap-x-2 text-[#212121] transition-all hover:text-[#C54B3E]"
              href="/profile"
            >
              <User2 className="h-5 w-5" />
              <span>{session?.user?.name?.split(' ')[0]}</span>
            </Link>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-x-3 lg:gap-x-6">
          <div className="hidden sm:block">
            <NavLinks mode="desktop" locale={locale} />
          </div>
          <div className="block sm:hidden">
            <MobileSidebar locale={locale} />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
