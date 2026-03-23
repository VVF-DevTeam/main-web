'use client'

// Libraries
import React from 'react'
import Link from 'next/link'

// Components
import MobileSidebar from './_navbar/mobileSidebar'
import NavLinks from './_navbar/navLinks'
import AuthButtons from './_navbar/authButtons'
import CustomIcon from '@/components/icon/CustomIcon'

// Main Component
const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex h-[100px] w-full items-center bg-white shadow-md md:px-2 lg:px-6">
      {/* Mobile: flex-between logo + hamburger */}
      <div className="flex w-full items-center justify-between px-2 md:hidden">
        <div className="flex h-[70px] items-center pl-2">
          <Link href="/">
            <CustomIcon />
          </Link>
        </div>
        <MobileSidebar />
      </div>

      {/* Desktop: 3-col grid — logo | nav links | auth */}
      <div className="hidden md:grid w-full grid-cols-3 items-center px-2 md:pr-4 lg:pl-8 lg:pr-8">
        <div className="flex h-[70px] items-center pl-2">
          <Link href="/">
            <CustomIcon />
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <NavLinks mode="desktop" />
        </div>
        <div className="flex items-center justify-end">
          <AuthButtons mode="desktop" />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
