// Libraries
import type { Metadata } from 'next'
import TranslationsProvider from '@/components/translator/TranslationsProvider'
import initTranslation from '@/app/i18n'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import i18nConfig from '@/i18nConfig'

// Components
import { Toaster as SonnerToaster } from 'sonner'
import { SessionProvider } from 'next-auth/react'

// CSS and CSS Modules
import '@/lib/ui/css/globals.css'
// import { taipro } from '@/lib/ui/fonts/TaiHeritagePro'
// import { roboto } from '@/lib/ui/fonts/Roboto'
import { beVietnamPro } from '@/lib/ui/fonts/BeVietnamPro'
import { lato } from '@/lib/ui/fonts/Lato'

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

// Generate static params for all supported locales
export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }))
}

// Main Component
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  
  // Validate locale - if invalid, use default locale to prevent errors
  const validLocale = i18nConfig.locales.includes(locale)
    ? locale
    : i18nConfig.defaultLocale
  
  const { resources } = await initTranslation(validLocale, i18nNamespaces)

  return (
    <TranslationsProvider // Wrap to translate any client side component using useTranslation hook from react-i18next
      namespaces={i18nNamespaces}
      locale={validLocale}
      resources={resources}
    >
      <html lang="en">
        <body
          className={`antialiased ${beVietnamPro.variable} ${lato.variable} min-w-full`}
        >
          <SessionProvider>
            <main>{children}</main>
            <SonnerToaster duration={6000} />
          </SessionProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </TranslationsProvider>
  )
}
