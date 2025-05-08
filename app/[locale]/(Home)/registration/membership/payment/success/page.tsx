import { auth } from '@/auth'
import PaymentSuccess from '@/components/payment/PaymentSuccess'

// Interfaces
interface SubscriptionPaymentSuccessPageProps {
  params: Promise<{ locale: string; classKeyName: string }>
}

// Main Component
const SubscriptionPaymentSuccessPage = async ({
  params,
}: SubscriptionPaymentSuccessPageProps) => {
  const { locale } = await params

  // get current user name
  const session = await auth()
  const userName = session?.user?.name!

  return (
    <PaymentSuccess
      title="VVF Membership"
      userName={userName}
      locale={locale}
      translationWorkspaces={['membership']}
    />
  )
}

export default SubscriptionPaymentSuccessPage
