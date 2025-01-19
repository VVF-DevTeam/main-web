import type { Config } from 'next-i18n-router/dist/types'

const i18nConfig: Config = {
  locales: ['en', 'vi', 'fr'], // Add your supported locales
  defaultLocale: 'en', // Set your default locale
  prefixDefault: true,
}

export default i18nConfig