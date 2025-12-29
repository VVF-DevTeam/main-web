import PaymentSuccess from '@/components/payment/PaymentSuccess'
import { auth } from '@/auth'

// No use of header or live database, but uses auth() so can be dynamic
export const dynamic = 'force-dynamic'

// Interfaces
interface SubscriptionPaymentSuccessPageProps {
  params: Promise<{ locale: string; classKeyName: string }>
}

// Main Component
const SubscriptionPaymentSuccessPage = async ({
  params,
}: SubscriptionPaymentSuccessPageProps) => {
  const { locale } = await params

  // Check if user is authenticated
  const session = await auth()
  const isGuestCheckout = !session?.user

  return (
    <PaymentSuccess
      title="VVF Membership"
      locale={locale}
      translationWorkspaces={['membership']}
      isGuestCheckout={isGuestCheckout}
    />
  )
}

export default SubscriptionPaymentSuccessPage
