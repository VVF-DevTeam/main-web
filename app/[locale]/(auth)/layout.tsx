import React from 'react'
import Navbar from '@/app/[locale]/(Home)/_components/navbar'

const Layout = async ({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) => {
  const { locale } = await params;

  return (
    <div className="relative h-full min-h-fit w-full min-w-full bg-[#EFB9A2]/20">
      <Navbar locale={locale}/>
      <div className="min-h-screen">{children}</div>
    </div>
  )
}

export default Layout
