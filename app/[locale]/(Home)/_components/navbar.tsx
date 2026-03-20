'use client'

// Libraries
import React from 'react'
import Link from 'next/link'

// Components
import MobileSidebar from './_navbar/mobileSidebar'
import NavLinks from './_navbar/navLinks'
import CustomIcon from '@/components/icon/CustomIcon'

// Main Component
const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex h-[100px] w-full items-center bg-white shadow-md md:px-2 lg:px-6">
      {/* NextJS Image and Dark Overlay (add relative to parent code)*/}
      {/* <div className="white-overlay"></div>
      <Image
        src="https://drive.google.com/thumbnail?id=18KrAvZmI1kaoe16AjXSp_6cKC3GZXl4v"
        alt="Intro"
        className="next-background object-top"
        fill
        priority
      /> */}

      {/* Nav Links */}

      <div className="flex-between w-full items-center gap-x-4 px-2 lg:pl-8 md:pr-6 lg:pr-16">
        <div className="flex h-[70px] w-full items-center gap-x-4 pl-2">
          {/* Company Logo with Slogan*/}
          <Link href="/" className="">
            <CustomIcon />
          </Link>


        </div>

        {/* Nav Links */}
        <div className="flex-center gap-x-3 lg:gap-x-6">
          <div className="hidden sm:block">
            <NavLinks mode="desktop" />
          </div>
          <div className="block sm:hidden">
            <MobileSidebar />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
