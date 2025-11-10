'use client'

import NormalCheckoutButton from '@/components/payment/NormalCheckoutButton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { useState, useEffect, useRef } from 'react'
import { getRemainSessions } from '@/lib/actions/event/getRemainSessions'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { PaymentType } from '@prisma/client'

type PaymentButtonType = 'drop-in' | 'full-course'

interface EventNormalCheckOutProps {
  stripePriceId?: string
  stripeProductId?: string
  formLink?: string // form link is a legacy property from the old version of the website for payment
  eventKeyName: string
  userId: string
  eventId: string
  stripeSubscribedPriceId?: string
  price: number
  fullCourseDiscount?: number
  email: string
  type: string
}

export default function EventNormalCheckOut({
  stripePriceId,
  stripeProductId,
  formLink,
  eventKeyName,
  userId,
  eventId,
  stripeSubscribedPriceId,
  price,
  fullCourseDiscount,
  email,
  type,
}: EventNormalCheckOutProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentType, setPaymentType] = useState<PaymentButtonType>('drop-in')
  const [remainSessions, setRemainSessions] = useState(0)
  const [fullCoursePrice, setFullCoursePrice] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevShowFormRef = useRef(false)
  const discount = fullCourseDiscount ? (100 - fullCourseDiscount) / 100 : 1

  // Check if the user is subscribed to the class and get remaining sessions
  useEffect(() => {
    const checkSubAndSessions = async () => {
      try {
        const [subResult, sessions] = await Promise.all([
          checkSubscription(userId),
          getRemainSessions(eventId),
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
  }, [userId, eventId, price])

  // Scroll to bottom when form is opened (transition from false to true)
  useEffect(() => {
    if (showForm && !prevShowFormRef.current && containerRef.current) {
      // Find the closest scrollable parent
      let element: HTMLElement | null = containerRef.current
      let scrollableParent: HTMLElement | null = null

      while (element && !scrollableParent) {
        const { overflowY } = window.getComputedStyle(element)
        if (overflowY === 'auto' || overflowY === 'scroll') {
          scrollableParent = element
          break
        }
        element = element.parentElement
      }

      // Scroll to bottom after a short delay to ensure iframe is rendered
      const timeoutId = setTimeout(() => {
        if (scrollableParent) {
          scrollableParent.scrollTo({
            top: scrollableParent.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 300) // Small delay for iframe to start rendering

      prevShowFormRef.current = showForm
      return () => clearTimeout(timeoutId)
    }
    prevShowFormRef.current = showForm
  }, [showForm])

  return (
    // Edit classname if needed
    <>
      {formLink ? (
        // Link to google form payment (for old courses)
        // <Link href={formLink!} target="_blank" rel="noopener noreferrer">
        //   <Button variant={'gray'}>
        //     {t('reserve-button')} <ArrowRight className="h-4 w-4" />
        //   </Button>
        // </Link>
        <div ref={containerRef}>
          {!showForm ? (
            <Button variant={'gray'} onClick={() => setShowForm(true)}>
              {t('reserve-button')} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="w-full max-w-full">
              <iframe 
                id="form-iframe"
                title="form-iframe"
                src={formLink!} 
                width="100%" 
                height="600"
                className="min-h-[600px] w-full rounded border"
              ></iframe>
            </div>
          )}
        </div>
      ) : (
        <div ref={containerRef} className="flex flex-col gap-4">
          {isLoading ? (
            <Button disabled>Loading...</Button>
          ) : (
            <>
              {!isSubscribed && (
                <p className="text-sm text-gray-500">
                  {t('payment-membershipIntro')}{' '}
                  <Link
                    href="/registration/membership"
                    className="text-textColor-blue hover:underline"
                  >
                    membership
                  </Link>
                  !
                </p>
              )}
              <RadioGroup
                value={paymentType}
                onValueChange={(value) =>
                  setPaymentType(value as PaymentButtonType)
                }
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="drop-in" id="drop-in" />
                  <Label htmlFor="drop-in">
                    {type === 'Class' ? 'Drop-in' : t('buy-tickets')}{' '}
                    {isSubscribed
                      ? `(${Math.round(price * 0.8 * 100) / 100}$)`
                      : `(${Math.round(price * 100) / 100}$)`}{' '}
                  </Label>
                </div>
                {type === 'Class' && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full-course" id="full-course" />
                    <Label htmlFor="full-course">
                      Full course - {remainSessions} {t('sessions')} (
                      {fullCourseDiscount}% off){' '}
                      {isSubscribed
                        ? `(${Math.round(fullCoursePrice * 0.8 * 100) / 100}$)`
                        : `(${Math.round(fullCoursePrice * 100) / 100}$)`}
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {paymentType === 'drop-in' ? (
                <NormalCheckoutButton
                  stripePriceId={
                    isSubscribed ? stripeSubscribedPriceId! : stripePriceId!
                  }
                  stripeProductId={stripeProductId!}
                  eventKeyName={eventKeyName}
                  userId={userId}
                  eventId={eventId}
                  buttonText="reserve-button"
                  type={
                    type === 'Class' ? 'ClassDropIn' : (type as PaymentType)
                  }
                  email={email}
                />
              ) : (
                <NormalCheckoutButton
                  stripePriceId={
                    isSubscribed ? stripeSubscribedPriceId! : stripePriceId!
                  }
                  stripeProductId={stripeProductId!}
                  eventKeyName={eventKeyName}
                  userId={userId}
                  eventId={eventId}
                  buttonText="reserve-button"
                  type="ClassFullCourse"
                  price={
                    isSubscribed
                      ? Math.round(fullCoursePrice * 0.8)
                      : Math.round(fullCoursePrice)
                  }
                  numberSession={remainSessions}
                  email={email}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
