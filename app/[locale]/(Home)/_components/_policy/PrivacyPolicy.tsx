import React from 'react'
import initTranslations from '@/app/i18n'
import Link from 'next/link'

const PrivacyPolicy = async ({locale}: {locale: string}) => {
  const { t } = await initTranslations(locale, ['policy'])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{t('header')}</h1>
      <p className="text-sm text-gray-600 mb-6">{t('lastUpdated')}</p>
      <p className="mb-6">{t('introduction')}</p>
      <p className="mb-8 italic">{t('consent')}</p>
      
      <div className="space-y-6">
        {/* Section 1: Who We Are */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section1.header')}</h2>
          <ul className="list-none space-y-2 mb-4">
            <li><strong>{t('section1.organization')}:</strong> {t('section1.organizationValue')}</li>
            <li><strong>{t('section1.address')}:</strong> {t('section1.addressValue')}</li>
            <li><strong>{t('section1.website')}:</strong> <a href="https://www.vietvibe.org" target="_blank" rel="noopener noreferrer" className="text-textColor-blue hover:underline">https://www.vietvibe.org</a></li>
            <li><strong>{t('section1.contactEmail')}:</strong> <a href="mailto:tech@vietvibe.org" className="text-textColor-blue hover:underline">tech@vietvibe.org</a></li>
          </ul>
          <p>{t('section1.description')}</p>
        </section>

        {/* Section 2: Information We Collect */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section2.header')}</h2>
          
          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section2.subsection1.header')}</h3>
          <p className="mb-4">{t('section2.subsection1.description')}</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>{t('section2.subsection1.item1')}</li>
            <li>{t('section2.subsection1.item2')}</li>
            <li>{t('section2.subsection1.item3')}</li>
            <li>{t('section2.subsection1.item4')}</li>
            <li>{t('section2.subsection1.item5')}</li>
            <li>{t('section2.subsection1.item6')}</li>
          </ul>
          <p className="mb-4">{t('section2.subsection1.note')}</p>
          <p className="mb-4">
            {t('section2.subsection1.profileNote')}{' '}
            <Link href={`/${locale}/profile/user`} className="text-textColor-blue hover:underline">
              {t('section2.subsection1.profile')}
            </Link>
            .
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section2.subsection2.header')}</h3>
          <p className="mb-4">{t('section2.subsection2.description')}</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>{t('section2.subsection2.item1')}</li>
            <li>{t('section2.subsection2.item2')}</li>
            <li>{t('section2.subsection2.item3')}</li>
          </ul>
          <p className="mb-4">{t('section2.subsection2.note')} <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-textColor-blue hover:underline">{t('stripe-policy')}</a>.</p>

          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section2.subsection3.header')}</h3>
          <p className="mb-4">{t('section2.subsection3.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section2.subsection3.item1')}</li>
            <li>{t('section2.subsection3.item2')}</li>
            <li>{t('section2.subsection3.item3')}</li>
            <li>{t('section2.subsection3.item4')}</li>
            <li>{t('section2.subsection3.item5')}</li>
          </ul>
        </section>

        {/* Section 3: Facebook & Instagram Data */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section3.header')}</h2>
          
          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section3.subsection1.header')}</h3>
          <p className="mb-4">{t('section3.subsection1.description')}</p>

          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section3.subsection2.header')}</h3>
          <p className="mb-4">{t('section3.subsection2.description')}</p>
          <p className="mb-4">{t('section3.subsection2.note')}</p>

          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section3.subsection3.header')}</h3>
          <p className="mb-4">{t('section3.subsection3.description')}</p>
        </section>

        {/* Section 4: Cookies & Tracking Technologies */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section4.header')}</h2>
          <p className="mb-4">{t('section4.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section4.item1')}</li>
            <li>{t('section4.item2')}</li>
            <li>{t('section4.item3')}</li>
          </ul>
          <p className="mt-4">{t('section4.note')}</p>
        </section>

        {/* Section 5: How We Use Your Information */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section5.header')}</h2>
          <p className="mb-4">{t('section5.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section5.item1')}</li>
            <li>{t('section5.item2')}</li>
            <li>{t('section5.item3')}</li>
            <li>{t('section5.item4')}</li>
            <li>{t('section5.item5')}</li>
            <li>{t('section5.item6')}</li>
          </ul>
        </section>

        {/* Section 6: Data Sharing & Disclosure */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section6.header')}</h2>
          <p className="mb-4">{t('section6.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section6.item1')}</li>
            <li>{t('section6.item2')}</li>
            <li>{t('section6.item3')}</li>
          </ul>
          <p className="mt-4 italic">{t('section6.note')}</p>
        </section>

        {/* Section 7: Data Retention */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section7.header')}</h2>
          <p className="mb-4">{t('section7.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section7.item1')}</li>
            <li>{t('section7.item2')}</li>
            <li>{t('section7.item3')}</li>
          </ul>
          <p className="mt-4">{t('section7.note')}</p>
        </section>

        {/* Section 8: Your Privacy Rights */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section8.header')}</h2>
          
          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section8.subsection1.header')}</h3>
          <p className="mb-4">{t('section8.subsection1.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section8.subsection1.item1')}</li>
            <li>{t('section8.subsection1.item2')}</li>
            <li>{t('section8.subsection1.item3')}</li>
            <li>{t('section8.subsection1.item4')}</li>
            <li>{t('section8.subsection1.item5')}</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 mt-4">{t('section8.subsection2.header')}</h3>
          <p className="mb-4">{t('section8.subsection2.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section8.subsection2.item1')}</li>
            <li>{t('section8.subsection2.item2')}</li>
            <li>{t('section8.subsection2.item3')}</li>
          </ul>
        </section>

        {/* Section 9: Data Deletion Requests */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section9.header')}</h2>
          <p className="mb-4">{t('section9.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('section9.item1')}</li>
            <li>{t('section9.item2')}</li>
          </ul>
          <p className="mt-4">{t('section9.note')}</p>
        </section>

        {/* Section 10: Data Security */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section10.header')}</h2>
          <p>{t('section10.description')}</p>
        </section>

        {/* Section 11: Children's Privacy */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section11.header')}</h2>
          <p>{t('section11.description')}</p>
        </section>

        {/* Section 12: Third-Party Links */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section12.header')}</h2>
          <p className="mb-4">{t('section12.description')}</p>
          <p>{t('section12.note')}</p>
        </section>

        {/* Section 13: Changes to This Privacy Policy */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section13.header')}</h2>
          <p>{t('section13.description')}</p>
        </section>

        {/* Section 14: Contact Us */}
        <section>
          <h2 className="text-xl font-semibold mb-3">{t('section14.header')}</h2>
          <p>{t('section14.description')} <a href="mailto:tech@vietvibe.org" className="text-textColor-blue hover:underline">tech@vietvibe.org</a></p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicy 