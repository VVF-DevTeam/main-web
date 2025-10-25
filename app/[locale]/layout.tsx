// Libraries
import type { Metadata } from 'next'
import TranslationsProvider from '@/components/translator/TranslationsProvider'
import initTranslation from '@/app/i18n'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

// Components
import { Toaster as SonnerToaster } from 'sonner'

// CSS and CSS Modules
import '@/lib/ui/css/globals.css'
// import { taipro } from '@/lib/ui/fonts/TaiHeritagePro'
// import { roboto } from '@/lib/ui/fonts/Roboto'
import { beVietnamPro } from '@/lib/ui/fonts/BeVietnamPro'

// Metadata
export const metadata: Metadata = {
  title: 'Viet Vibe Foundation',
  description: 'Viet Vibe Foundation',
}

// namespaces for translations
const i18nNamespaces = [
  'homePage',
  'common',
  'event',
  'job',
  'profile',
  'signIn-signUp',
  'membership',
  'policy',
  'post',
  'host',
]

// Main Component
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const { resources } = await initTranslation(locale, i18nNamespaces)

  return (
    <TranslationsProvider // Wrap to translate any client side component using useTranslation hook from react-i18next
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <html lang="en">
        <body
          className={`antialiased  ${beVietnamPro.variable} min-w-full`}
        >
          <main>{children}</main>
          <SonnerToaster />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </TranslationsProvider>
  )
}
