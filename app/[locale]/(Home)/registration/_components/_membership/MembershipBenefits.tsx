// Libraries
import initTranslation from '@/app/i18n'
import NormalCheckoutButton from '@/components/payment/NormalCheckoutButton'
import { auth } from '@/auth'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import Link from 'next/link'
import FeatureItem from './FeatureItem'
interface MembershipBenefitsProps {
  locale: string
}

export const MembershipBenefits = async ({
  locale,
}: MembershipBenefitsProps) => {
  const { t } = await initTranslation(locale, ['membership', 'common'])
  const session = await auth()
  const userId = session?.user?.id
  const email = session?.user?.email!
  const isMember = await checkSubscription(userId)

  const benefits = [
    {
      title: t('basic-membership'),
      price: 30,
      priceId: 'price_1RMRIL06wc04MarV1S2YkKdS',
      features: [
        { key: 'basic-feature-1', text: t('basic-feature-1') },
        { key: 'basic-feature-2', text: t('basic-feature-2') },
        { key: 'basic-feature-3', text: t('basic-feature-3') },
        { key: 'basic-feature-4', text: t('basic-feature-4') },
      ],
    },
    {
      title: t('premium-membership'),
      price: 35,
      priceId: 'price_1ShQNl06wc04MarVvGNKWiSH',
      features: [
        { key: 'premium-feature-1', text: t('premium-feature-1') },
        { key: 'premium-feature-2', text: t('premium-feature-2') },
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
            {tier.title} (Annually)
          </h3>
          <p className="mb-4 text-3xl font-bold">{tier.price} CAD</p>
          <ul className="space-y-3">
            {tier.features.map((feature, featureIndex) => (
              <FeatureItem
                key={featureIndex}
                feature={feature.text}
                featureKey={feature.key}
                locale={locale}
              />
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
                  email={email}
                />
              </div>
            )
          ) : (
            <div className="absolute bottom-[15px] left-7">
              <p>
                {t('become-member-login-1')}{' '}
                <Link
                  href="/signIn"
                  className="text-blue-500 hover:text-blue-600 hover:underline"
                >
                  {t('become-member-login-2')}
                </Link>{' '}
                {t('become-member-login-3')}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
