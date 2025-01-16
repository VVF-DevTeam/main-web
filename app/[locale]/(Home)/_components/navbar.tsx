import React from 'react'
import MobileSidebar from './mobileSidebar'
import NavLinks from './navLinks'
import { User2 } from 'lucide-react'
import CompanyLogo from '@/app/components/CustomIcon'
import { auth } from '@/auth'
import AuthButtons from './authButtons'
const Navbar = async () => {
  const session = await auth()

  return (
    <nav className="h-[110px] w-full bg-[#EFB9A2]/20 p-6">
      <div className="flex h-full w-full items-center justify-between">
        <div className="flex h-full w-full items-center gap-x-4">
          <CompanyLogo />
          
          {/* User Button */}
          {session?.user?.id && (
            <button className="flex items-center justify-center gap-x-2 text-[#1B171A] transition-all hover:text-[#1B171A]/70">
              <User2 className="h-6 w-6" />
              <span>{session?.user?.name?.split(' ')[0]}</span>
            </button>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-x-4">
          <div className="hidden sm:block">
            <NavLinks mode="desktop" />
          </div>
          <div className="block sm:hidden">
            <MobileSidebar />
          </div>
          <AuthButtons userExists={!!session?.user} />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
