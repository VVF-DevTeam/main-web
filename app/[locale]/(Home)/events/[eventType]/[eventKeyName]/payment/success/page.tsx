import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import PaymentSuccess from '@/components/payment/PaymentSuccess'

// Interfaces
interface ClassPaymentSuccessPageProps {
  params: Promise<{ locale: string; eventKeyName: string }>
}

// Main Component
const ClassPaymentSuccessPage = async ({
  params,
}: ClassPaymentSuccessPageProps) => {
  const { locale, eventKeyName } = await params

  // get current user name
  const session = await auth()
  const userName = session?.user?.name!

  // get current user email
  const userEmail = session?.user?.email!

  //
  const publishedClass = await prisma.event.findUnique({
    where: { keyName: eventKeyName },
    select: { title: true },
  })

  if (!publishedClass) return null

  return (
    <PaymentSuccess
      title={publishedClass.title}
      userName={userName}
      userEmail={userEmail}
      locale={locale}
      translationWorkspaces={['event']}
    />
  )
}

export default ClassPaymentSuccessPage
