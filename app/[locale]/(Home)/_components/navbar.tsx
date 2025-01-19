import React from 'react'
import MobileSidebar from './mobileSidebar'
import NavLinks from './navLinks'
import { User2 } from 'lucide-react'
import CompanyLogo from '@/app/[locale]/components/CustomIcon'
import { auth } from '@/auth'
import AuthButtons from './authButtons'

const Navbar = async ({locale}:{ locale: string }) => {

  const session = await auth()

  return (
    <nav className="h-[110px] w-full bg-[#EFB9A2]/20 p-6">
      <div className="flex h-full w-full items-center justify-between">
        <div className="flex h-full w-full items-center gap-x-4">
          <CompanyLogo />

          {/* User Button */}
          {session?.user?.id && (
            <button
              className="flex items-center justify-center gap-x-2 text-[#1B171A] transition-all hover:text-[#1B171A]/70">
              <User2 className="h-5 w-5" />
              <span className="text-[#1B171A]">
                {session?.user?.name?.split(' ')[0]}
              </span>
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-x-3 lg:gap-x-6">
          <div className="hidden sm:block">
            <NavLinks mode="desktop" locale={locale} />
          </div>
          <div className="block sm:hidden">
            <MobileSidebar locale={locale}/>
          </div>
          <AuthButtons userExists={!!session?.user} />
        </div>



      </div>
    </nav>
  )
}

export default Navbar
