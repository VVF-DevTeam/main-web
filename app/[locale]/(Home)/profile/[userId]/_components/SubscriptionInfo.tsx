'use client'

import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'

interface SubscriptionInfoProps {
  user: {
    id: string
    name: string
    email: string
  }
  paymentHistory: any[]
}

export default function SubscriptionInfo({
  user,
  paymentHistory,
}: SubscriptionInfoProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')

  console.log(paymentHistory)
  const activeSubscription = paymentHistory.find(
    (payment) => payment.expiresAt > new Date()
  )

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-textColor-black mb-4 text-2xl font-semibold">
          {t('subscription-status')}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-textColor-gray">{t('current-plan')}</span>
            <span className="font-medium">
              {activeSubscription ? (
                <p className="text-textColor-green">{t('active')}</p>
              ) : (
                <p className="">{t('no-active-subscription')}</p>
              )}
            </span>
          </div>

          {activeSubscription && (
            <>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-textColor-gray">{t('expires-at')}</span>
                <span className="font-medium">
                  {format(new Date(activeSubscription.expiresAt), 'PPP')}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-textColor-gray">{t('plan-type')}</span>
                <span className="font-medium">{activeSubscription.type}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-textColor-black mb-4 text-xl font-semibold">
          {t('subscription-history')}
        </h3>
        <div className="space-y-4">
          {paymentHistory.map((payment) =>
            payment.type === 'Membership' ? (
              <div
                key={payment.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="text-sm text-textColor-gray">
                    {format(new Date(payment.createdAt), 'PPP')}
                  </p>
                  <p className="text-sm text-textColor-gray">
                    - {format(new Date(payment.expiresAt), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${payment.pricePaid}</p>
                  <p className="text-sm text-textColor-gray">{payment.type}</p>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
