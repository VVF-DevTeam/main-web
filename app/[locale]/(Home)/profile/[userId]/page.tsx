import { getInfo } from '@/lib/utilFunctions/getInfo'
import initTranslation from '@/app/i18n'
import TranslationsProvider from '@/components/translator/TranslationsProvider'

const i18nNamespaces = ['profile']
import ProfileClient from './_components/ProfileClient'

const Profile = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const { resources } = await initTranslation(locale, i18nNamespaces)
  const user = await getInfo()
  if (!user) return <p className="mt-10 text-center">No user data available.</p>
  return (
    <TranslationsProvider // Wrap to translate any client side component using useTranslation hook from react-i18next
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}
    >
      <div className="overflow-hidden">
        <ProfileClient user={user} />
      </div>
    </TranslationsProvider>
  )
}

export default Profile
