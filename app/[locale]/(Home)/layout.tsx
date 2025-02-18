import Footer from '@/app/[locale]/(Home)/_components/footer'
import Navbar from '@/app/[locale]/(Home)/_components/navbar'
import TranslationsProvider from '@/components/translator/TranslationsProvider'
import initTranslation from '@/app/i18n'
import Header from '@/app/[locale]/(Home)/_components/header'
import Copyright from './_components/copyright'

const i18nNamespaces = ['homePage', 'common', 'event']

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  const { resources } = await initTranslation(locale, i18nNamespaces)

  return (
    <TranslationsProvider // Wrap to translate any client side component using useTranslation hook from react-i18next
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <div className="relative h-full min-h-screen w-full">
        <div>
          <Header />
          <Navbar locale={locale} />
        </div>
        <div className="min-h-screen">{children}</div>
        <div className="mt-auto">
          <Footer locale={locale} />
          <Copyright locale={locale}/>
        </div>
      </div>
    </TranslationsProvider>
  )
}

export default Layout
