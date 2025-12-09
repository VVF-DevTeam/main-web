import PaymentSuccess from '@/components/payment/PaymentSuccess'

// No use of auth() or header or live database, so can be static
export const dynamic = 'force-static'

// Interfaces
interface SubscriptionPaymentSuccessPageProps {
  params: Promise<{ locale: string; classKeyName: string }>
}

// Main Component
const SubscriptionPaymentSuccessPage = async ({
  params,
}: SubscriptionPaymentSuccessPageProps) => {
  const { locale } = await params

  return (
    <PaymentSuccess
      title="VVF Membership"
      locale={locale}
      translationWorkspaces={['membership']}
    />
  )
}

export default SubscriptionPaymentSuccessPage
