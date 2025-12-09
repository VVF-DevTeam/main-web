import { prisma } from '@/lib/db'
import PaymentSuccess from '@/components/payment/PaymentSuccess'

// No use of auth() or header or live database, so can be static
export const dynamic = 'force-static'

// Interfaces
interface ClassPaymentSuccessPageProps {
  params: Promise<{ locale: string; eventKeyName: string }>
}

// Main Component
const ClassPaymentSuccessPage = async ({
  params,
}: ClassPaymentSuccessPageProps) => {
  const { locale, eventKeyName } = await params

  const publishedClass = await prisma.event.findUnique({
    where: { keyName: eventKeyName },
    select: { title: true },
  })

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
