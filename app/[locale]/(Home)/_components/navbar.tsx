// Libraries
import React from 'react'
import { auth } from '@/auth'
import { User2 } from 'lucide-react'
import Link from 'next/link'
// import Image from 'next/image'

// Components
import MobileSidebar from './_navbar/mobileSidebar'
import NavLinks from './_navbar/navLinks'
import CompanyLogo from '@/app/[locale]/components/CustomIcon'

// Main Component
const Navbar = async ({ locale }: { locale: string }) => {
  // TODO: Move session to parent component
  const session = await auth()

  return (
    <nav className="sticky z-10 h-[90px] w-full bg-[#d2d0d0]/50 px-6 shadow-sm backdrop-blur-sm">
      {/* NextJS Image and Dark Overlay (add relative to parent code)*/}
      {/* <div className="white-overlay"></div>
      <Image
        src="https://drive.google.com/thumbnail?id=1b17wtI8m9C1isfbJC7w-vbG_B5oe8wW9&sz=w1000"
        alt="Intro"
        className="next-background object-top"
        fill
        priority
      /> */}

      {/* Nav Links */}
      <div className="flex-between">
        <div className="flex h-full w-full items-center gap-x-4">
          {/* Company Logo with Slogan*/}
          <Link href="/" className="flex-col-center -mt-5">
            <CompanyLogo />
            <p className="-mt-7 text-[9px] header-font-black"> Grow together, Shine together</p>
          </Link>

          {/* User Button */}
          {session?.user?.id && (
            <Link
              className="flex-center -ml-10 md:-ml-5 gap-x-[5px] text-textColor transition-all hover:text-textColor-brand"
              href=""
              aria-label="Go to user profile"
            >
              <User2 className="h-5 w-5" />
              <span>{session?.user?.name?.split(' ')[0]}</span>
            </Link>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-center gap-x-3 lg:gap-x-6">
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
