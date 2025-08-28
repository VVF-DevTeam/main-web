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
import Image from 'next/image'

// Main Component
const Navbar = async ({ locale }: { locale: string }) => {
  // TODO: Move session to parent component
  const session = await auth()

  return (
    <nav className="sticky z-10 top-0 w-full px-6 shadow-md dark:bg-bgColor-blackLight">

      {/* NextJS Image and Dark Overlay (add relative to parent code)*/}
      <div className="white-overlay"></div>
      <Image
        src="https://drive.google.com/thumbnail?id=18KrAvZmI1kaoe16AjXSp_6cKC3GZXl4v&sz=w1000"
        alt="Intro"
        className="next-background object-top"
        fill
        priority
      />

      {/* Nav Links */}

      <div className="flex-between items-center">
        <div className="flex h-[70px] w-full items-center gap-x-4">
          {/* Company Logo with Slogan*/}
          <Link href="/" className='-ml-10 md:-ml-2'>
            <CompanyLogo />
          </Link>

          {/* User Button */}
          {session?.user?.id && (
            <Link
              className="flex-center -ml-12 gap-x-[5px] text-textColor transition-all hover:text-textColor-brand md:-ml-10"
              href={`/profile/${session?.user?.name}`}
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
