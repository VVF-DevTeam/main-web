import React from 'react'
import { Users, Volleyball, Guitar, Handshake, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import initTranslation from '@/app/i18n'

type Benefit = {
  key: string
  icon: LucideIcon
}

const benefits: Benefit[] = [
  {
    key: 'sports',
    icon: Volleyball,
  },
  {
    key: 'music',
    icon: Guitar,
  },
  {
    key: 'volunteer',
    icon: Users,
  },
  {
    key: 'community',
    icon: Handshake,
  },
]

const StudentsPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  const { t } = await initTranslation(locale, ['students', 'common'])
  const session = await auth()
  const isLoggedIn = Boolean(session?.user?.id)

  return (
    <main className='w-full bg-bgColor-white'>
      <section className='bg-bgColor-secondary200 px-6 py-20 md:py-24'>
        <div className='mx-auto flex w-full max-w-5xl flex-col items-center text-center'>
          <h1 className='max-w-4xl text-3xl font-bold leading-tight md:text-5xl'>
            {t('studentsPage.heroTitle')}
          </h1>

          <p className='mt-6 max-w-3xl text-base leading-relaxed'>
            {t('studentsPage.heroDescription')}
          </p>

          {isLoggedIn ? (
            <Button
              type='button'
              className='mt-10 rounded-full bg-bgColor-brandDark900 px-10 py-6 text-base font-semibold text-textColor-white transition-colors hover:bg-bgColor-brandDark600'
              variant='default'
              size='lg'
              asChild
            >
              <Link href='/students/verify'>{t('studentsPage.verifyButton')}</Link>
            </Button>
          ) : (
            <p className='mt-10 text-base font-semibold text-textColor-brandDark900'>
              {t('studentsPage.loginPromptPrefix')}{' '}
              <Link href='/signIn' className='underline underline-offset-4'>
                {t('studentsPage.loginPromptLink')}
              </Link>{' '}
              {t('studentsPage.loginPromptSuffix')}
            </p>
          )}

          <p className='mt-8 text-xs leading-relaxed text-textColor-brandDark600'>
            {t('studentsPage.termsPrefix')}{' '}
            <Link
              href='/students/termsAndConditions'
              className='underline underline-offset-4'
            >
              {t('studentsPage.termsLinkText')}
            </Link>{' '}
            {t('studentsPage.termsSuffix')}
          </p>
        </div>
      </section>

      <section className='bg-bgColor-white px-6 py-20 md:py-24'>
        <div className='mx-auto w-full max-w-6xl'>
          <h2 className='mx-auto max-w-3xl text-center text-3xl font-extrabold leading-tight md:text-5xl'>
            {t('studentsPage.aboutTitle')}
          </h2>

          <div className='mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4'>
            {benefits.map((benefit) => (
              <article
                key={benefit.key}
                className='flex flex-col items-center text-center'
              >
                <div className='flex h-24 w-24 items-center justify-center rounded-full bg-bgColor-secondary200 text-4xl font-bold text-textColor-brandDark900'>
                  <benefit.icon className='h-10 w-10' />
                </div>
                <h3 className='mt-6 text-2xl font-semibold leading-snug'>
                  {t(`studentsPage.benefits.${benefit.key}.title`)}
                </h3>
                <p className='mt-3 text-lg leading-relaxed'>
                  {t(`studentsPage.benefits.${benefit.key}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default StudentsPage
