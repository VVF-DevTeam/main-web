import PaymentSuccess from '@/components/payment/PaymentSuccess'
import { auth } from '@/auth'

// Uses auth() so can be dynamic
export const dynamic = 'force-dynamic'

interface ShopPaymentSuccessPageProps {
  params: Promise<{ locale: string }>
}

const ShopPaymentSuccessPage = async ({ params }: ShopPaymentSuccessPageProps) => {
  const { locale } = await params

  // Check if user is authenticated
  const session = await auth()
  const isGuestCheckout = !session?.user

  return (
    <PaymentSuccess
      title="Shop Purchase"
      locale={locale}
      // Reuse existing payment-success strings (no shop workspace exists yet)
      translationWorkspaces={['event']}
      isGuestCheckout={isGuestCheckout}
    />
  )
}

export default ShopPaymentSuccessPage


