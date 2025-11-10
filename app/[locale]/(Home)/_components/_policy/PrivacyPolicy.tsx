import React from 'react'
import initTranslations from '@/app/i18n'

const PrivacyPolicy = async ({locale}: {locale: string}) => {
  const { t } = await initTranslations(locale, ['policy'])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('header')}</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section1.header')}</h2>
          <p className="mb-4">{t('section1.description')}</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>{t('section1.item1')}</li>
            <li>{t('section1.item2')}</li>
            <li>{t('section1.item3')}</li>
            <li>{t('section1.item4')}</li>
            <li>{t('section1.item5')}</li>
            <li>{t('section1.item6')}</li>
          </ul>
          <p className="mb-4"> {t('section1.note')} <span className="font-bold">website</span> {t('and')} <span className="font-bold">mobile app</span>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section2.header')}</h2>
          <p className="mb-4">
            {t('section2.description')}
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>{t('section2.item1')}</li>
            <li>{t('section2.item2')}</li>
            <li>{t('section2.item3')}</li>
            <li>{t('section2.item4')}</li>
          </ul>

          <p className="mb-4">{t('section2.note')} <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-textColor-blue">{t('stripe-policy')}</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section3.header')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section3.item1')}</li>
            <li>{t('section3.item2')}</li>
            <li>{t('section3.item3')}</li>
            <li>{t('section3.item4')}</li>
            <li>{t('section3.item5')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section4.header')}</h2>
          <p className="mb-4">
            {t('section4.description')}
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section4.item1')}</li>
            <li>{t('section4.item2')}</li>
            <li>{t('section4.item3')}</li>
            <li>{t('section4.item4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section5.header')}</h2>
          <p className="mb-4">{t('section5.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section5.item1')}</li>
            <li>{t('section5.item2')}</li>
            <li>{t('section5.item3')}</li>
            <li>{t('section5.item4')}</li>
            <li>{t('section5.item5')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section6.header')}</h2>
          <p>
            {t('section6.description')}
          </p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicy 