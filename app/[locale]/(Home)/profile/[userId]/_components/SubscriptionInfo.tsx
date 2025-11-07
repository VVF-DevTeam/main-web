'use client'

import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Decimal } from '@prisma/client/runtime/library'
import { PaymentType } from '@prisma/client'
import CancelSubscriptionButton from './CancelSubscriptionButton'

interface User {
  subscribedAt: Date | null
  subscribeExpires: Date | null
  stripeSubscriptionId: string | null
  id: string
}

interface PaymentHistoryItem {
  id: string
  pricePaid: Decimal
  createdAt: Date
  type: PaymentType
  expiresAt?: Date | null
  event: {
    id: string
    title: string
    keyName: string
    imgUrl: string | null
    startDate: Date | null
    endDate: Date
    location: string | null
  } | null
}

export default function SubscriptionInfo({
  paymentHistory,
  user,
}: {
  paymentHistory: PaymentHistoryItem[]
  user: User
}) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')

  const getSubscriptionType = (createdAt: Date, expiresAt: Date) => {
    const months =
      (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return months >= 12 ? 'Annual' : 'Monthly'
  }

  const activeSubscription = paymentHistory.find(
    (payment) => payment.expiresAt && payment.expiresAt > new Date()
  )

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-textColor-black mb-4 text-2xl font-semibold">
          {t('subscription-status')}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-textColor-gray500">{t('current-plan')}</span>
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
                <span className="text-textColor-gray500">{t('expires-at')}</span>
                <span className="font-medium">
                  {format(
                    new Date(activeSubscription.expiresAt as Date),
                    'PPP'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-textColor-gray500">{t('plan-type')}</span>
                <span className="font-medium">
                  {activeSubscription &&
                    getSubscriptionType(
                      new Date(activeSubscription.createdAt),
                      new Date(activeSubscription.expiresAt as Date)
                    )}
                </span>
              </div>
              <CancelSubscriptionButton
                subscriptionId={user.stripeSubscriptionId}
              />
              <p className="text-textColor-gray500 italic text-sm">
                *{t('cancel-subscription-description')}
              </p>
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
                  <p className="text-sm text-textColor-gray500">
                    {format(new Date(payment.createdAt), 'PPP')}
                  </p>
                  <p className="text-sm text-textColor-gray500">
                    - {format(new Date(payment.expiresAt as Date), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${payment.pricePaid.toString()}</p>
                  <p className="text-sm text-textColor-gray500">{payment.type}</p>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
