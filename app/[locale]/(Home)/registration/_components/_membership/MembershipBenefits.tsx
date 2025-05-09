// Libraries
import initTranslation from '@/app/i18n'
import NormalCheckoutButton from '@/components/payment/NormalCheckoutButton'
import { auth } from '@/auth'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
interface MembershipBenefitsProps {
  locale: string
}

export const MembershipBenefits = async ({
  locale,
}: MembershipBenefitsProps) => {
  const { t } = await initTranslation(locale, ['membership', 'common'])
  const session = await auth()
  const userId = session?.user?.id
  const isMember = await checkSubscription(userId)

  const benefits = [
    {
      title: t('basic-membership'),
      price: 5,
      priceId: 'price_1RMH3r06wc04MarV0wWvGuq9',
      features: [
        t('basic-feature-1'),
        t('basic-feature-2'),
        t('basic-feature-3'),
      ],
    },
    {
      title: t('premium-membership'),
      price: 7,
      priceId: 'price_1RMdOq06wc04MarVTraVJ0GL',
      features: [
        t('premium-feature-1'),
        t('premium-feature-2'),
        t('premium-feature-3'),
        t('premium-feature-4'),
      ],
    },
    // {
    //   title: t('vip-membership'),
    //   price: t('vip-price'),
    //   features: [
    //     t('vip-feature-1'),
    //     t('vip-feature-2'),
    //     t('vip-feature-3'),
    //     t('vip-feature-4'),
    //   ],
    // },
  ]

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
      {benefits.map((tier, index) => (
        <div
          key={index}
          className="relative rounded-lg border p-6 pb-20 shadow-sm transition-shadow hover:shadow-md"
        >
          <h3 className="mb-2 text-2xl font-semibold text-primary">
            {tier.title}
          </h3>
          <p className="mb-4 text-3xl font-bold">{tier.price}</p>
          <ul className="space-y-3">
            {tier.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-center">
                <svg
                  className="mr-2 h-5 w-5 text-green-500"
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
          {userId ? (
            isMember ? (
              <div className="absolute bottom-[15px] left-7 text-green-600">
                <p>{t('have-member')}</p>
              </div>
            ) : (
              <div className="absolute bottom-[15px] left-7">
                <NormalCheckoutButton
                  stripePriceId={tier.priceId}
                  stripeProductId="prod_SGnQhahDiUFrsq"
                  userId={userId}
                  buttonText="become-member"
                  type="Membership"
                />
              </div>
            )
          ) : (
            <div className="absolute bottom-[15px] left-7">
              <p>{t('become-member-login')}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
