import Footer from '@/app/[locale]/(Home)/_components/footer'
import Navbar from '@/app/[locale]/(Home)/_components/navbar'
import Header from '@/app/[locale]/(Home)/_components/header'
import ChatWidget from '@/app/[locale]/(Home)/_components/chatWidget'
// import Copyright from './_components/copyright'

export const dynamic = 'force-dynamic'

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
      <Navbar />

      <div className="min-h-[calc(100vh-120px)]">{children}</div>
      <div className="mt-auto">
        <Footer locale={locale} />
      </div>
      <ChatWidget />
    </div>
  )
}

export default Layout
