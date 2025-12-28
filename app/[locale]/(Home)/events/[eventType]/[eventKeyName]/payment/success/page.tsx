import PaymentSuccess from '@/components/payment/PaymentSuccess'
import { getEventTitleByKeyName } from '@/lib/actions/event/getEvent'

// No use of auth() or header or live database, so can be static
export const dynamic = 'auto'

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

  return (
    <PaymentSuccess
      title={publishedClass.title}
      locale={locale}
      translationWorkspaces={['event']}
    />
  )
}

export default ClassPaymentSuccessPage
