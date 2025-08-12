import React from 'react'
import Navbar from '@/app/[locale]/(Home)/_components/navbar'
import Header from '@/app/[locale]/(Home)/_components/header'
import Footer from '@/app/[locale]/(Home)/_components/footer'

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <div className="relative h-full min-h-fit w-full min-w-full bg-bgColor-brandLighter bg-cover bg-center bg-no-repeat">
      <Header />
      <Navbar locale={locale} />
      <div className="min-h-[calc(100vh-120px)] content-center">{children}</div>
      <div className="mt-auto">
        <Footer locale={locale} />
      </div>
    </div>
  )
}

export default Layout
