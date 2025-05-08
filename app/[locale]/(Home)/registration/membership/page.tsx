// Libraries
import { Separator } from '@/components/ui/separator'
import initTranslation from '@/app/i18n'
import NormalCheckoutButton from '@/components/payment/NormalCheckoutButton'
import { auth } from '@/auth'

// Components
import { MembershipHeader } from '../_components/_membership/MembershipHeader'
import { MembershipBenefits } from '../_components/_membership/MembershipBenefits'

const MembershipPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  const { t } = await initTranslation(locale, ['membership', 'common'])
  const session = await auth()
  const userId = session?.user?.id

  return (
    <div className="flex flex-col gap-y-6 p-4 pt-8 text-base md:pt-16 md:text-lg">
      <MembershipHeader locale={locale} />
      <Separator className="my-4" />
      <MembershipBenefits locale={locale} />
      {userId ? (
        <div className="mt-8 flex justify-center">
          <NormalCheckoutButton
            stripePriceId="price_1RMH3r06wc04MarV0wWvGuq9"
            stripeProductId="prod_SGnQhahDiUFrsq"
            userId={userId}
            buttonText="become-member"
            type="Membership"
          />
        </div>
      ) : (
        <div className="mt-8 flex justify-center">
          <p>{t('become-member-login')}</p>
        </div>
      )}
    </div>
  )
}

export default MembershipPage
