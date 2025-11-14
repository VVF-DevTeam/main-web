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

  // get current user email
  const userEmail = session?.user?.email!

  return (
    <PaymentSuccess
      title="VVF Membership"
      userName={userName}
      locale={locale}
      translationWorkspaces={['membership']}
      userEmail={userEmail}
    />
  )
}

export default SubscriptionPaymentSuccessPage
