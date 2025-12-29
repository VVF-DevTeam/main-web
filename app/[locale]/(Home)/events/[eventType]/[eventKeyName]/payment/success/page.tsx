import PaymentSuccess from '@/components/payment/PaymentSuccess'
import { getEventTitleByKeyName } from '@/lib/actions/event/getEvent'
import { auth } from '@/auth'

// No use of header or live database, but uses auth() so can be dynamic
export const dynamic = 'force-dynamic'

// Interfaces
interface ClassPaymentSuccessPageProps {
  params: Promise<{ locale: string; eventKeyName: string }>
}

// Main Component
const ClassPaymentSuccessPage = async ({
  params,
}: ClassPaymentSuccessPageProps) => {
  const { locale, eventKeyName } = await params

  const publishedClass = await getEventTitleByKeyName(eventKeyName)

  if (!publishedClass) return null

  // Check if user is authenticated
  const session = await auth()
  const isGuestCheckout = !session?.user

  return (
    <PaymentSuccess
      title={publishedClass.title}
      locale={locale}
      translationWorkspaces={['event']}
      isGuestCheckout={isGuestCheckout}
    />
  )
}

export default ClassPaymentSuccessPage
