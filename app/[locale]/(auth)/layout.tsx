import React from 'react'
import Navbar from '@/app/[locale]/(Home)/_components/navbar'
import Header from '@/app/[locale]/(Home)/_components/header'
import TranslationsProvider from '@/components/translator/TranslationsProvider'
import initTranslation from '@/app/i18n'

const i18nNamespaces = ['homePage', 'common']

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
      <div className="relative h-full min-h-fit w-full min-w-full bg-[#EFB9A2]/20">
        <Header />
        <Navbar locale={locale} />
        <div className="min-h-screen">{children}</div>
      </div>
    </TranslationsProvider>
  )
}

export default Layout
