import Link from 'next/link'
import { auth } from '@/auth'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

import initTranslations from '@/app/i18n'

import BecomeHostForm from '../_components/_becomeHost/BecomeHostForm'

const MembershipPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  const { t } = await initTranslations(locale, ['host', 'common'])
  // Get the current user's id
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="mx-auto flex flex-col items-center justify-center gap-4 pb-4 pt-10 text-center text-2xl">
        <p className="text-4xl font-bold">
          {t('becomehost-notLogin1')}{' '}
          <Link
            href="/signIn"
            className="text-textColor-blue underline underline-offset-4 hover:text-textColor-blue/50"
          >
            {t('becomehost-notLogin2')}
          </Link>{' '}
          {t('becomehost-notLogin3')}
        </p>
        <Image
          src="https://drive.google.com/thumbnail?id=19tM0WbHYTAMlN_y8MkpYs8ZxoXUMAZYD&sz=w2000"
          alt="Not Found"
          width={450}
          height={450}
        />
        <Link
          href="/"
          className="group flex items-center gap-2 text-blue-500 transition-colors duration-300 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" />
          {t('goHome')}
        </Link>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-y-6 p-4 text-base md:pb-8 md:text-lg">
      <BecomeHostForm locale={locale} userId={userId} />
    </div>
  )
}

export default MembershipPage
