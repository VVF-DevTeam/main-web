import PaymentSuccess from '@/components/payment/PaymentSuccess'
import { getEventTitleByKeyName } from '@/lib/actions/event/getEvent'
import { auth } from '@/auth'

// No use of header or live database, but uses auth() so can be dynamic
export const dynamic = 'force-dynamic'

// Interfaces
interface EventPaymentSuccessPageProps {
  params: Promise<{ locale: string; eventKeyName: string }>
}

// Main Component
const EventPaymentSuccessPage = async ({
  params,
}: EventPaymentSuccessPageProps) => {
  const { locale, eventKeyName } = await params

  const publishedEvent = await getEventTitleByKeyName(eventKeyName)

  if (!publishedEvent) return null

  // Check if user is authenticated
  const session = await auth()
  const isGuestCheckout = !session?.user

  return (
    <PaymentSuccess
      title={publishedEvent.title}
      locale={locale}
      translationWorkspaces={['event']}
      isGuestCheckout={isGuestCheckout}
    />
  )
}

export default EventPaymentSuccessPage
