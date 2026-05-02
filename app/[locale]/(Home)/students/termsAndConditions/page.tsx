import initTranslation from '@/app/i18n'
import Link from 'next/link'

interface StudentTermsAndConditionsPageProps {
  params: Promise<{ locale: string }>
}

const StudentTermsAndConditionsPage = async ({
  params,
}: StudentTermsAndConditionsPageProps) => {
  const { locale } = await params
  const { t } = await initTranslation(locale, ['students'])

  return (
    <main className="w-full bg-bgColor-white">
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-3xl font-bold">{t('termsPage.title')}</h1>
        <p className="mb-6 text-sm text-gray-600">{t('termsPage.lastUpdated')}</p>
        <p className="mb-6">{t('termsPage.intro')}</p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t('termsPage.sections.eligibilityTitle')}
            </h2>
            <p>{t('termsPage.eligibility')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t('termsPage.sections.verificationTitle')}
            </h2>
            <p>{t('termsPage.verification')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">{t('termsPage.sections.usageTitle')}</h2>
            <p>{t('termsPage.usage')}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Contact Us</h2>
            <p>
              If you have questions, concerns, or data requests, contact us at:{' '}
              <Link href="mailto:tech@vietvibe.org" className="text-textColor-blue hover:underline">
                tech@vietvibe.org
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default StudentTermsAndConditionsPage
