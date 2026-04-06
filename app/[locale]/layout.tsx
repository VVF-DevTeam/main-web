// Libraries
import type { Metadata } from 'next'
import { headers } from 'next/headers'
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

const toCamelCase = (segment: string) => {
  const parts = segment.split(/[-_]+/).filter(Boolean)
  if (parts.length === 0) return segment

  const [first, ...rest] = parts
  return (
    first.toLowerCase() +
    rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('')
  )
}

const formatPathTitle = (pathname: string) => {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '')
  const segments = pathWithoutLocale.split('/').filter(Boolean)

  if (segments.length === 0) {
    return 'Home'
  }

  const lastSegment = segments[segments.length - 1]
  const camel = toCamelCase(lastSegment)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

// Metadata fallback for routes without page-level metadata
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
  'shop',
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
            <SonnerToaster duration={20000} />
          </SessionProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </TranslationsProvider>
  )
}
