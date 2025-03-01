// Libraries
import React from 'react'
import { auth } from '@/auth'
import { User2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Components
import MobileSidebar from './mobileSidebar'
import NavLinks from './navLinks'
import CompanyLogo from '@/app/[locale]/components/CustomIcon'

const Navbar = async ({ locale }: { locale: string }) => {
  const session = await auth()

  return (
    <nav className="relative h-[110px] w-full p-6 shadow-md">
      {/* NextJS Image and Dark Overlay */}
      <div className="white-overlay"></div>
      <Image
        src="https://drive.google.com/thumbnail?id=1b17wtI8m9C1isfbJC7w-vbG_B5oe8wW9&sz=w1000"
        alt="Intro"
        className="next-background object-top"
        fill
        priority
      />

      {/* Nav Links */}
      <div className="flex-between h-full w-full">
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
