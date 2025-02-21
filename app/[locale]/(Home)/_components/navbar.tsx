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
      <div className={`whiteOverlay`}></div>
      <Image
        src="https://drive.google.com/thumbnail?id=1b17wtI8m9C1isfbJC7w-vbG_B5oe8wW9&sz=w1000"
        alt="Intro"
        className={`nextBG object-top`}
        fill
        priority
      />
      <div className="flex h-full w-full items-center justify-between">
        <div className="flex h-full w-full items-center gap-x-4">
          <Link href="/">
            <CompanyLogo />
          </Link>
          {/* User Button */}
          {session?.user?.id && (
            <Link
              className="-ml-10 flex items-center justify-center gap-x-2 text-[#212121] transition-all hover:text-[#C54B3E]"
              href=""
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
