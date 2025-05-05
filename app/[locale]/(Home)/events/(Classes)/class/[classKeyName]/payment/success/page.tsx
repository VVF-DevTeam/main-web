import { prisma } from '@/lib/db'
import initTranslations from '@/app/i18n'
import '@/lib/ui/css/lineAnimation.css'

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

  const publishedClass = await prisma.event.findUnique({
    where: { keyName: classKeyName },
    select: { title: true },
  })

  if (!publishedClass) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-neutral-900 text-center">
      {/* Checkmark SVG */}
      <svg
        className="w-20 h-20 text-green-500 mb-6"
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
      <h1 className="text-2xl font-bold text-green-600 mb-2">
        {t('paymentSuccess-header')}
      </h1>
      <p className="text-lg text-neutral-700 dark:text-neutral-300 max-w-xl">
         {t('paymentSuccess-text')} <strong>{publishedClass.title}</strong>
      </p>
    </div>
  )
}

export default ClassPaymentCancelPage