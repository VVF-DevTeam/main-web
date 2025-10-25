import Footer from '@/app/[locale]/(Home)/_components/footer'
import Navbar from '@/app/[locale]/(Home)/_components/navbar'
import Header from '@/app/[locale]/(Home)/_components/header'
// import Copyright from './_components/copyright'

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <div className="relative h-full min-h-screen w-full">
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
