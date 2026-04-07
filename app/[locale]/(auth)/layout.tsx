import React from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Navbar from '@/app/[locale]/(Home)/_components/navbar'
import Header from '@/app/[locale]/(Home)/_components/header'
import Footer from '@/app/[locale]/(Home)/_components/footer'

const toTitleWords = (segment: string) =>
  segment
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatPathTitle = (pathname: string) => {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '')
  const segments = pathWithoutLocale.split('/').filter(Boolean)

  if (segments.length === 0) {
    return 'Authentication'
  }

  const lastSegment = segments[segments.length - 1]
  return toTitleWords(lastSegment)
}

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers()
  const pathname = headerStore.get('current-path') || '/'
  const pathTitle = formatPathTitle(pathname)

  return {
    title: `${pathTitle} | Viet Vibe Foundation`,
    description:
      'Connect the Vietnamese community in Vancouver through art, sport, and music',
    icons: {
      icon: '/logo/main-logo-white.jpg',
      shortcut: '/logo/main-logo-white.jpg',
      apple: '/logo/main-logo-white.jpg',
    },
    openGraph: {
      images: [
        {
          url: '/logo/main-logo-white.jpg',
          alt: 'Viet Vibe Foundation',
        },
      ],
    },
  }
}

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <div className="relative h-full min-h-fit w-full min-w-full bg-bgColor-secondary200 bg-cover bg-center bg-no-repeat">
      <Header />
      <Navbar />
      <div className="min-h-[calc(100vh-120px)] content-center">{children}</div>
      <div className="mt-auto">
        <Footer locale={locale} />
      </div>
    </div>
  )
}

export default Layout
