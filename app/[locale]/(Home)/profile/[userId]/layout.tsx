'use server'

import { getUserInfo } from '@/lib/utilFunctions/getUserInfo'
import initTranslation from '@/app/i18n'
import TranslationsProvider from '@/components/translator/TranslationsProvider'
import Sidebar from './_components/SideBar'

const i18nNamespaces = ['profile']

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; userId: string }>
}) {
  const { locale, userId } = await params
  const { resources } = await initTranslation(locale, i18nNamespaces)
  const user = await getUserInfo()

  if (!user) {
    return <p className="mt-10 text-center">No user data available.</p>
  }

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <div className="bg-bgColor-white flex min-h-screen flex-col md:flex-row">
        {/* Sidebar (Passes locale & userId for navigation) */}
        <Sidebar locale={locale} userId={userId} />

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-10">{children}</div>
      </div>
    </TranslationsProvider>
  )
}
