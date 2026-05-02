import React from 'react'
import initTranslations from '@/app/i18n'
import Link from 'next/link'

const RefundPolicy = async ({ locale }: { locale: string }) => {
  const { t } = await initTranslations(locale, ['policy'])

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-3xl font-bold">{t('refundPolicy.header')}</h1>
      <p className="mb-6 text-sm text-gray-600">{t('refundPolicy.lastUpdated')}</p>
      <p className="mb-6">{t('refundPolicy.introduction')}</p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-xl font-semibold">
            {t('refundPolicy.eventTickets.header')}
          </h2>
          <p className="mb-4">{t('refundPolicy.eventTickets.description')}</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>{t('refundPolicy.eventTickets.item1')}</li>
            <li>{t('refundPolicy.eventTickets.item2')}</li>
            <li>{t('refundPolicy.eventTickets.item3')}</li>
            <li>{t('refundPolicy.eventTickets.item4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">{t('refundPolicy.shop.header')}</h2>
          <p className="mb-4">{t('refundPolicy.shop.description')}</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>{t('refundPolicy.shop.item1')}</li>
            <li>{t('refundPolicy.shop.item2')}</li>
            <li>{t('refundPolicy.shop.item3')}</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">3. Contact Us</h2>
          <p>
            If you have questions, concerns, or data requests, contact us at:{' '}
            <Link href="mailto:tech@vietvibe.org" className="text-textColor-blue hover:underline">
              tech@vietvibe.org
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default RefundPolicy
