// Libraries
import initTranslation from '@/app/i18n'

interface MembershipBenefitsProps {
  locale: string
}

export const MembershipBenefits = async ({ locale }: MembershipBenefitsProps) => {
  const { t } = await initTranslation(locale, ['membership', 'common'])

  const benefits = [
    {
      title: t('basic-membership'),
      price: t('basic-price'),
      features: [
        t('basic-feature-1'),
        t('basic-feature-2'),
        t('basic-feature-3'),
      ],
    },
    {
      title: t('premium-membership'),
      price: t('premium-price'),
      features: [
        t('premium-feature-1'),
        t('premium-feature-2'),
        t('premium-feature-3'),
        t('premium-feature-4'),
      ],
    },
    {
      title: t('vip-membership'),
      price: t('vip-price'),
      features: [
        t('vip-feature-1'),
        t('vip-feature-2'),
        t('vip-feature-3'),
        t('vip-feature-4'),
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {benefits.map((tier, index) => (
        <div
          key={index}
          className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-2xl font-semibold text-primary mb-2">{tier.title}</h3>
          <p className="text-3xl font-bold mb-4">{tier.price}</p>
          <ul className="space-y-3">
            {tier.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
} 