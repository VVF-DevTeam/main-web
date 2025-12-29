'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useSession } from 'next-auth/react'
import '@/lib/ui/css/lineAnimation.css'

interface PaymentSuccessProps {
  title: string
  locale: string
  translationWorkspaces: string[]
  isGuestCheckout?: boolean
}

const PaymentSuccess = ({
  title,
  locale,
  translationWorkspaces,
  isGuestCheckout = false,
}: PaymentSuccessProps) => {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation(translationWorkspaces)
  const { data: session, status } = useSession()

  // Show loading state while checking session (only if not already determined as guest)
  if (!isGuestCheckout && status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-neutral-900">
        <p className="text-lg text-neutral-700 dark:text-neutral-300">
          Loading...
        </p>
      </div>
    )
  }

  const userName = session?.user?.name || ''
  const userEmail = session?.user?.email || ''

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
        {t('paymentSuccess-text')} <strong>{title}</strong>
      </p>
      {isGuestCheckout ? (
        <p className="max-w-xl text-lg text-neutral-700 dark:text-neutral-300">
          {t('paymentSuccess-guest-email')}
        </p>
      ) : (
        userEmail && (
          <p className="max-w-xl text-lg text-neutral-700 dark:text-neutral-300">
            {t('paymentSuccess-text2')} <strong>{userEmail}</strong>
          </p>
        )
      )}
      {!isGuestCheckout && userName && (
        <p className="max-w-xl text-lg text-neutral-700 dark:text-neutral-300">
          {t('paymentSuccess-profile-text')}{' '}
          <Link
            href={`/profile/${userName}`}
            className="text-textColor-blue underline"
          >
            {t('paymentSuccess-profile-link')}
          </Link>
          .
        </p>
      )}

      <p className="max-w-xl text-lg text-neutral-700 dark:text-neutral-300">
        {t('paymentSuccess-closing')}
      </p>
    </div>
  )
}

export default PaymentSuccess
