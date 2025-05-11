'use client'

import NormalCheckoutButton from '@/components/payment/NormalCheckoutButton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { useState, useEffect } from 'react'
import { getRemainSessions } from '@/lib/actions/event/getRemainSessions'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type PaymentType = 'drop-in' | 'full-course'

interface ClassNormalCheckOutProps {
  stripePriceId?: string
  stripeProductId?: string
  formLink?: string // form link is a legacy property from the old version of the website for payment
  classKeyName: string
  userId: string
  classId: string
  stripeSubscribedPriceId?: string
  price: number
  fullCourseDiscount?: number
}

export default function ClassNormalCheckOut({
  stripePriceId,
  stripeProductId,
  formLink,
  classKeyName,
  userId,
  classId,
  stripeSubscribedPriceId,
  price,
  fullCourseDiscount,
}: ClassNormalCheckOutProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentType, setPaymentType] = useState<PaymentType>('drop-in')
  const [remainSessions, setRemainSessions] = useState(0)
  const [fullCoursePrice, setFullCoursePrice] = useState(0)
  const discount = fullCourseDiscount ? (100 - fullCourseDiscount) / 100 : 1

  // Check if the user is subscribed to the class and get remaining sessions
  useEffect(() => {
    const checkSubAndSessions = async () => {
      try {
        const [subResult, sessions] = await Promise.all([
          checkSubscription(userId),
          getRemainSessions(classId),
        ])
        setRemainSessions(sessions)
        setIsSubscribed(subResult)
        setFullCoursePrice(price * discount * sessions)
      } catch (error) {
        console.error('Error checking subscription or sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkSubAndSessions()
  }, [userId, classId, price])

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
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <Button disabled>Loading...</Button>
          ) : (
            <>
              {!isSubscribed && (
                <p className="text-sm text-gray-500">
                  {t('payment-membershipIntro')}{' '}
                  <Link
                    href="/registration/membership"
                    className="text-blue-500 hover:underline"
                  >
                    membership
                  </Link>
                  !
                </p>
              )}
              <RadioGroup
                value={paymentType}
                onValueChange={(value) => setPaymentType(value as PaymentType)}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="drop-in" id="drop-in" />
                  <Label htmlFor="drop-in">
                    Drop-in {isSubscribed ? `(${price * 0.8}$)` : `(${price}$)`}{' '}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full-course" id="full-course" />
                  <Label htmlFor="full-course">
                    Full course - {remainSessions} {t('sessions')} ({fullCourseDiscount}% off){' '}
                    {isSubscribed
                      ? `(${Math.round(fullCoursePrice * 0.8)}$)`
                      : `(${Math.round(fullCoursePrice)}$)`}
                  </Label>
                </div>
              </RadioGroup>

              {paymentType === 'drop-in' ? (
                <NormalCheckoutButton
                  stripePriceId={
                    isSubscribed ? stripeSubscribedPriceId! : stripePriceId!
                  }
                  stripeProductId={stripeProductId!}
                  eventKeyName={classKeyName}
                  userId={userId}
                  eventId={classId}
                  buttonText="reserve-button"
                  type="ClassDropIn"
                />
              ) : (
                <NormalCheckoutButton
                  stripePriceId={
                    isSubscribed ? stripeSubscribedPriceId! : stripePriceId!
                  }
                  stripeProductId={stripeProductId!}
                  eventKeyName={classKeyName}
                  userId={userId}
                  eventId={classId}
                  buttonText="reserve-button"
                  type="ClassFullCourse"
                  price={isSubscribed ? Math.round(fullCoursePrice * 0.8) : Math.round(fullCoursePrice)}
                  numberSession={remainSessions}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
