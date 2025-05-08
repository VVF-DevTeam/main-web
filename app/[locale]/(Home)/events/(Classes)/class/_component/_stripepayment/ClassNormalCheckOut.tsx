'use client'

import NormalCheckoutButton from '@/components/payment/NormalCheckoutButton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'

interface ClassNormalCheckOutProps {
  stripePriceId?: string
  stripeProductId?: string
  formLink?: string // form link is a legacy property from the old version of the website for payment
  classKeyName: string
  userId: string
  classId: string
}

export default function ClassNormalCheckOut({
  stripePriceId,
  stripeProductId,
  formLink,
  classKeyName,
  userId,
  classId,
}: ClassNormalCheckOutProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')

  return (
    // Edit classname if needed
    <>
      {formLink ? (
        // Link to google form payment (for old courses)
        <Link href={formLink!} target="_blank" rel="noopener noreferrer">
          <Button variant={'gray'}>
            {t('reserve-button')} <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <NormalCheckoutButton
          stripePriceId={stripePriceId!}
          stripeProductId={stripeProductId!} // stripeProductId will exist if stripePriceId exists
          eventKeyName={classKeyName}
          userId={userId}
          eventId={classId}
          buttonText='reserve-button'
          type='Class'
        />
      )}
    </>
  )
}
