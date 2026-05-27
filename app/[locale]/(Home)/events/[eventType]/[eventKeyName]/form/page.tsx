import initTranslations from '@/app/i18n'
import PostPaymentEventForm from '@/components/payment/PostPaymentEventForm'
import { verifyPostPaymentFormAccess } from '@/lib/actions/payment/postPaymentForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface EventFormPageProps {
  params: Promise<{
    locale: string
    eventType: string
    eventKeyName: string
  }>
  searchParams: Promise<{
    userId?: string
    paymentReference?: string
    guestEmail?: string
  }>
}

function StatusCard({
  title,
  description,
  locale,
  eventType,
  eventKeyName,
  backLabel,
}: {
  title: string
  description?: string
  locale: string
  eventType: string
  eventKeyName: string
  backLabel: string
}) {
  return (
    <div className="width-max-default mx-auto px-4 pb-16 pt-[100px] md:pt-[120px]">
      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
        <Link
          href={`/${locale}/events/${eventType}/${eventKeyName}`}
          className="mt-6 inline-block text-blue-600 underline hover:text-blue-700"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  )
}

const EventFormPage = async ({
  params,
  searchParams,
}: EventFormPageProps) => {
  const { locale, eventType, eventKeyName } = await params
  const { userId, paymentReference, guestEmail } = await searchParams

  const { t } = await initTranslations(locale, ['event', 'common'])

  const backLabel = t('post-payment-form-back-to-event')

  if ((!userId?.trim() && !paymentReference?.trim()) || !guestEmail?.trim()) {
    return (
      <StatusCard
        title={t('post-payment-form-error-missing_params')}
        description={String(t('post-payment-form-invalid-link-description'))}
        locale={locale}
        eventType={eventType}
        eventKeyName={eventKeyName}
        backLabel={backLabel}
      />
    )
  }

  const verification = await verifyPostPaymentFormAccess({
    userId,
    paymentReference,
    eventKeyName,
    guestEmail,
  })

  if (!verification.success) {
    const errorKey = `post-payment-form-error-${verification.error}`
    return (
      <StatusCard
        title={t(errorKey, {
          defaultValue: t('post-payment-form-error-server_error'),
        })}
        locale={locale}
        eventType={eventType}
        eventKeyName={eventKeyName}
        backLabel={backLabel}
      />
    )
  }

  if (verification.alreadySubmitted) {
    return (
      <StatusCard
        title={t('post-payment-form-error-already_submitted')}
        description={String(t('post-payment-form-already-submitted-description'))}
        locale={locale}
        eventType={eventType}
        eventKeyName={eventKeyName}
        backLabel={backLabel}
      />
    )
  }

  return (
    <PostPaymentEventForm
      paymentId={verification.paymentId}
      userId={userId}
      paymentReference={paymentReference}
      eventKeyName={eventKeyName}
      guestEmail={guestEmail}
      eventTitle={verification.eventTitle}
      guestName={verification.guestName}
      eventFormData={verification.eventFormData}
      locale={locale}
      eventType={eventType}
    />
  )
}

export default EventFormPage
