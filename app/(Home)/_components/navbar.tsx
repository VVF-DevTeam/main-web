import React from 'react'
import MobileSidebar from './mobileSidebar'
import NavLinks from './navLinks'
import CompanyLogo from '@/app/components/CustomIcon'
const Navbar = () => {
  return (
    <nav className="flex h-[110px] w-full items-center bg-[#EFB9A2]/20 p-6">
      <div className="h- flex w-full items-center justify-between">
        <CompanyLogo />
        <h1 className="text-2xl"> Viet Vibe Foundation</h1>
        <div className="hidden sm:block">
          <NavLinks mode="desktop" />
        </div>
        <div className="block sm:hidden">
          <MobileSidebar />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
