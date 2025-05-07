import { prisma } from '@/lib/db'
import initTranslations from '@/app/i18n'
import '@/lib/ui/css/lineAnimation.css'
import Link from 'next/link'
import { auth } from '@/auth'

// Interfaces
interface ClassPaymentCancelPageProps {
  params: Promise<{ locale: string; classKeyName: string }>
}

// Main Component
const ClassPaymentCancelPage = async ({
  params,
}: ClassPaymentCancelPageProps) => {
  const { locale, classKeyName } = await params
  const { t } = await initTranslations(locale, ['event', 'common'])

  // get current user name
  const session = await auth()
  const userName = session?.user?.name!

  //
  const publishedClass = await prisma.event.findUnique({
    where: { keyName: classKeyName },
    select: { title: true },
  })

  if (!publishedClass) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-neutral-900">
      {/* Checkmark SVG */}
      <svg
        className="mb-6 h-20 w-20 text-green-500"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="26"
          cy="26"
          r="25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="stroke-current"
        />
        <path
          d="M14 27l7 7 17-17"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="checkmark-path"
        />
      </svg>

      {/* Message */}
      <h1 className="mb-2 text-2xl font-bold text-green-600">
        {t('paymentSuccess-header')}
      </h1>
      <p className="max-w-xl text-lg text-neutral-700 dark:text-neutral-300">
        {t('paymentSuccess-text')} <strong>{publishedClass.title}</strong>
      </p>
      <p className="max-w-xl text-lg text-neutral-700 dark:text-neutral-300">
        Please check the payment details at{' '}
        <Link href={`/profile/${userName}`} className="text-blue-600 underline">
          your profile
        </Link>
        .
      </p>
    </div>
  )
}

export default ClassPaymentCancelPage
