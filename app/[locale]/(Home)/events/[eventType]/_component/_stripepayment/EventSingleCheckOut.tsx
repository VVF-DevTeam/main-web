'use client'

import NormalCheckoutButton from '@/components/payment/NormalCheckoutButton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EventTicket, PaymentType } from '@prisma/client'

interface EventSingleCheckOutProps {
  formLink?: string
  eventKeyName: string
  userId: string
  eventId: string
  tickets: EventTicket[]
  email: string
  type: string
  seatNumber?: string
  hideCheckoutButtons?: boolean // Hide individual checkout buttons (for cart summary)
}

const calculateTicketTotalPrice = (ticket: EventTicket): number => {
  const basePrice = Number(ticket.price) || 0

  if (ticket.payTotalNumber && ticket.payTotalNumber > 0) {
    return basePrice * ticket.payTotalNumber
  }

  return basePrice
}

const calculateMemberPrice = (
  ticket: EventTicket,
  totalPrice: number
): number | null => {
  if (ticket.discountMemberPercent == null) {
    return null
  }

  const discount = Math.max(0, Math.min(100, ticket.discountMemberPercent))
  const discounted = totalPrice * ((100 - discount) / 100)

  return Number.isFinite(discounted) ? discounted : null
}

const resolvePaymentType = (
  eventType: string,
  ticket: EventTicket
): PaymentType => {
  if (eventType === 'Class') {
    return ticket.payTotalNumber && ticket.payTotalNumber > 0
      ? PaymentType.ClassFullCourse
      : PaymentType.ClassDropIn
  }

  switch (eventType) {
    case 'Concert':
      return PaymentType.Concert
    case 'Camping':
      return PaymentType.Camping
    case 'Event':
      return PaymentType.Event
    default:
      return PaymentType.Event
  }
}

export default function EventSingleCheckOut({
  formLink,
  eventKeyName,
  userId,
  eventId,
  tickets,
  email,
  type,
  seatNumber,
  hideCheckoutButtons = false,
}: EventSingleCheckOutProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevShowFormRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const fetchSubscription = async () => {
      try {
        const subscribed = await checkSubscription(userId)
        if (isMounted) {
          setIsSubscribed(Boolean(subscribed))
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchSubscription()

    return () => {
      isMounted = false
    }
  }, [userId])

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

  const checkoutTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) => ticket.stripePriceId && ticket.stripeProductId
      ),
    [tickets]
  )

  const hasTickets = checkoutTickets.length > 0

  if (formLink) {
    return (
      <div ref={containerRef}>
        {!showForm ? (
          <Button
            variant={'gray'}
            onClick={() => setShowForm(true)}
            className="group"
          >
            {t('reserve-button')}{' '}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        ) : (
          <div className="w-full max-w-full">
            <iframe
              id="form-iframe"
              title="form-iframe"
              src={formLink}
              width="100%"
              height="600"
              className="min-h-[600px] w-full rounded border"
            ></iframe>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {isLoading ? (
        <Button disabled>Loading...</Button>
      ) : !hasTickets ? (
        <p className="text-sm text-red-600">
          {t('no-ticket-selected')}
        </p>
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

          <div className="flex flex-col gap-4">
            {checkoutTickets.map((ticket) => {
              const totalPrice = calculateTicketTotalPrice(ticket)
              const memberPrice = calculateMemberPrice(ticket, totalPrice)
              const stripePriceIdForUser =
                isSubscribed && ticket.subscribedStripePriceId
                  ? ticket.subscribedStripePriceId
                  : ticket.stripePriceId
              
              if (!stripePriceIdForUser || !ticket.stripeProductId) {
                return null
              }

              const paymentTypeValue = resolvePaymentType(type, ticket)
              const perSessionPrice = Number(ticket.price) || 0
              const currencyLabel = (ticket.currency || 'CAD').toUpperCase()

              return (
                <div
                  key={ticket.id}
                  className="relative flex flex-col gap-3 overflow-hidden rounded-md border bg-white p-4 shadow-sm"
                >
                  {/* Background Image - Right Half */}
                  {ticket.imageUrl && (
                    <div className="absolute bottom-0 right-0 top-0 w-1/2 overflow-hidden rounded-md">
                      <Image
                        src={ticket.imageUrl}
                        alt={`${ticket.type} ticket background`}
                        fill
                        className="object-cover"
                        sizes="50vw"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 drop-shadow-sm">
                        {ticket.type}
                      </span>
                      <span className="text-lg font-bold text-gray-900 drop-shadow-sm">
                        {/* {currencyLabel}  */}$
                        {isSubscribed && memberPrice !== null
                          ? memberPrice.toFixed(2)
                          : totalPrice.toFixed(2)}
                      </span>
                    </div>
                    {/* Display seat information - single seat only */}
                    {seatNumber ? (
                      // SINGLE SEAT: Show individual seat number
                      <span className="text-xs text-gray-500 drop-shadow-sm">
                        Seat Number: {seatNumber}
                      </span>
                    ) : (
                      // NO SEAT: Show session pricing (for Class events without assigned seats)
                      <>
                        {ticket.payTotalNumber && ticket.payTotalNumber > 0 ? (
                          // Full course: Show total sessions and per-session price
                          <span className="text-xs text-gray-500 drop-shadow-sm">
                            {t('total')} {ticket.payTotalNumber} {t('sessions')} -
                            ${perSessionPrice.toFixed(2)} {t('each')}
                          </span>
                        ) : (
                          // Drop-in: Show per-session price only
                          <span className="text-xs text-gray-500 drop-shadow-sm">
                            {/* {currencyLabel}  */} $
                            {perSessionPrice.toFixed(2)} {t('each')}
                          </span>
                        )}
                      </>
                    )}
                    {memberPrice !== null && (
                      <span className="text-xs text-gray-500 drop-shadow-sm">
                        {isSubscribed &&
                          `Member price applied: ${currencyLabel} ${memberPrice.toFixed(2)}`}
                      </span>
                    )}
                  </div>

                  {/* Individual checkout button (hidden when using master checkout in cart) */}
                  {!hideCheckoutButtons && (
                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <NormalCheckoutButton
                        stripePriceId={stripePriceIdForUser}
                        stripeProductId={ticket.stripeProductId}
                        eventKeyName={eventKeyName}
                        userId={userId}
                        eventId={eventId}
                        buttonText="reserve-button"
                        type={paymentTypeValue}
                        numberSession={ticket.payTotalNumber ?? undefined}
                        email={email}
                        seatNumber={seatNumber}
                        eventTicketId={ticket.id}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
