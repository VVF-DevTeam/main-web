'use client'

import SingleCheckoutButton from '@/components/payment/SingleCheckoutButton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Plus, Minus } from 'lucide-react'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { EventTicket, PaymentType } from '@prisma/client'
import { UserInfoProps } from '@/lib/types/userInfo'

export interface SelectedTicketWithQuantity {
  ticket: EventTicket
  quantity: number
}

interface EventSingleCheckOutProps {
  formLink?: string
  eventKeyName: string
  userId?: string | null
  eventId: string
  tickets: EventTicket[]
  type: string
  seatNumber?: string
  /**
   * Current selected tickets/quantities from parent (used to react to Clear All)
   * Only relevant when seatNumber is not provided (non-seated tickets)
   */
  selectedTickets?: SelectedTicketWithQuantity[]
  setSelectedTickets?: (selectedTickets: SelectedTicketWithQuantity[]) => void // Callback to pass selected tickets to parent
  userInfo?: UserInfoProps | null
}

const calculateTicketTotalPrice = (ticket: EventTicket): number => {
  const basePrice = Number(ticket.price) || 0
  const capacity = ticket.capacityPerTicket || 1

  // If payTotalNumber exists, this is a full course/event ticket
  if (ticket.payTotalNumber && ticket.payTotalNumber > 0) {
    return basePrice * capacity * ticket.payTotalNumber
  }

  // Otherwise, it's a single-session/drop-in ticket
  return basePrice * capacity
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
    case 'Shop':
      return PaymentType.Shop
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
  type,
  seatNumber,
  selectedTickets,
  setSelectedTickets,
  userInfo,
}: EventSingleCheckOutProps) {
  // @ts-ignore: useTranslation will always throw an error for typescript
  const { t } = useTranslation('event')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [emailVerified, setEmailVerified] = useState<Date | null | undefined>(
    undefined
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const prevShowFormRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    const fetchUserData = async () => {
      try {
        if (userId) {
          const subscribed = await checkSubscription(userId)
          if (isMounted) {
            setIsSubscribed(Boolean(subscribed))
            setEmailVerified(userInfo?.emailVerified ?? null)
          }
        } else {
          if (isMounted) {
            setEmailVerified(null)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUserData()

    return () => {
      isMounted = false
    }
  }, [userId, userInfo])

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
    () => {
      const currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0) // Set to start of day

      return tickets
        .filter((ticket) => ticket.stripePriceId && ticket.stripeProductId)
        .sort((a, b) => {
          // Helper function to check if ticket is expired
          const isTicketExpired = (ticket: EventTicket) => {
            if (!ticket.validTo) return false
            const validToDate = new Date(ticket.validTo)
            validToDate.setHours(0, 0, 0, 0)
            return validToDate < currentDate
          }

          const aExpired = isTicketExpired(a)
          const bExpired = isTicketExpired(b)

          // Non-expired tickets come first
          if (aExpired !== bExpired) {
            return aExpired ? 1 : -1
          }

          // Among tickets with same expiration status, sort by validTo date
          if (a.validTo && b.validTo) {
            return new Date(a.validTo).getTime() - new Date(b.validTo).getTime()
          }

          // Tickets without validTo date come after those with validTo
          if (a.validTo && !b.validTo) return -1
          if (!a.validTo && b.validTo) return 1

          return 0
        })
    },
    [tickets]
  )

  // Quantity handlers (only for non-seated tickets)
  const handleQuantityChange = useCallback(
    (ticketId: string, delta: number) => {
      // Don't allow quantity selection for seated tickets
      if (seatNumber) return
      // If no callback from parent, nothing to do
      if (!setSelectedTickets) return

      const current = selectedTickets ?? []
      const existing = current.find((st) => st.ticket.id === ticketId)
      const currentQty = existing?.quantity ?? 0
      const newQty = Math.max(0, currentQty + delta)

      let next: SelectedTicketWithQuantity[]

      if (newQty === 0) {
        // Remove ticket from selection
        next = current.filter((st) => st.ticket.id !== ticketId)
      } else {
        const ticket = tickets.find((t) => t.id === ticketId)
        if (!ticket) return

        if (existing) {
          // Update existing quantity
          next = current.map((st) =>
            st.ticket.id === ticketId ? { ticket, quantity: newQty } : st
          )
        } else {
          // Add new ticket selection
          next = [...current, { ticket, quantity: newQty }]
        }
      }

      setSelectedTickets(next)
    },
    [seatNumber, setSelectedTickets, selectedTickets, tickets]
  )

  const getQuantity = useCallback(
    (ticketId: string) => {
      if (!selectedTickets) return 0
      const found = selectedTickets.find((st) => st.ticket.id === ticketId)
      return found?.quantity ?? 0
    },
    [selectedTickets]
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
        <Button disabled>Loading tickets...</Button>
      ) : !hasTickets ? (
        <p className="text-sm text-red-600">{t('no-ticket-selected')}</p>
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

          {userId && userInfo?.email && !emailVerified && (
            <p className="text-sm text-bgColor-brand900">
              *{t('email-not-verified-warning-prefix')} <strong>{userInfo.email}</strong>{' '}
              {t('email-not-verified-warning-suffix')}{' '}
              <Link
                href={`/profile`}
                className="font-medium text-textColor-blue underline"
              >
                {t('verify-in-profile')}
              </Link>
              , {t('verify-email-reason')}
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
              // const currencyLabel = (ticket.currency || 'CAD').toUpperCase()

              // Check if ticket has expired (date only, ignoring time)
              const currentDate = new Date()
              currentDate.setHours(0, 0, 0, 0) // Set to start of day
              
              let isExpired = false
              if (ticket.validTo) {
                const validToDate = new Date(ticket.validTo)
                validToDate.setHours(0, 0, 0, 0) // Set to start of day
                isExpired = validToDate < currentDate
              }

              return (
                <div
                  key={ticket.id}
                  className={`relative flex flex-col gap-3 overflow-hidden rounded-md border p-4 shadow-sm ${
                    isExpired
                      ? 'bg-gray-100 opacity-60'
                      : 'bg-white'
                  }`}
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
                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      {/* Ticket type */}
                      <span className="text-lg font-bold text-gray-900 drop-shadow-sm">
                        {ticket.type}
                      </span>
                      <div className="flex flex-col items-end gap-0.5">
                        {isSubscribed && memberPrice !== null && (
                          <span className="text-xs text-gray-400 line-through drop-shadow-sm">
                            ${totalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className={`text-lg font-bold drop-shadow-sm ${isSubscribed && memberPrice !== null ? 'text-green-600' : 'text-gray-900'}`}>
                          ${isSubscribed && memberPrice !== null
                            ? memberPrice.toFixed(2)
                            : totalPrice.toFixed(2)}
                        </span>
                      </div>
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
                        {ticket.payTotalNumber && ticket.payTotalNumber > 1 ? (
                          // Full course: Show total sessions and per-session price (only if > 1 session)
                          <span className="text-xs text-gray-500 drop-shadow-sm">
                            {t('total')} {ticket.payTotalNumber} {t('sessions')}{' '}
                            - ${perSessionPrice.toFixed(2)} {t('each')}
                          </span>
                        ) : (
                          // Drop-in/Single ticket: Show per-session price only
                          <span className="text-xs text-gray-500 drop-shadow-sm">
                            {/* {currencyLabel}  */} $
                            {perSessionPrice.toFixed(2)} {t('each')}
                          </span>
                        )}
                      </>
                    )}

                    {/* Member price */}
                    {memberPrice !== null ? (
                      isSubscribed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600 w-fit">
                          ✦ {t('member-price-applied', { price: memberPrice.toFixed(2) })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 drop-shadow-sm w-fit">
                          ✦ {t('member-price', { price: memberPrice.toFixed(2) })}
                        </span>
                      )
                    ) : null}

                    {/* Valid To Date */}
                    {ticket.validTo && (
                      <span className={`text-xs drop-shadow-sm ${
                        isExpired ? 'font-semibold text-red-600' : 'text-gray-500'
                      }`}>
                        {isExpired ? t('ticket-expired') : t('valid-until')}:{' '}
                        {new Date(ticket.validTo).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}

                    {/* Quantity Selector (only for non-seated tickets) */}
                    {!seatNumber && !isExpired && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 drop-shadow-sm">
                          {t('add-to-cart')}:
                        </span>
                        <div className="flex items-center gap-2 rounded-md border border-gray-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(ticket.id, -1)}
                            className="h-8 w-8 rounded-l-md p-0 hover:bg-gray-100"
                            disabled={getQuantity(ticket.id) === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900">
                            {getQuantity(ticket.id)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(ticket.id, 1)}
                            className="h-8 w-8 rounded-r-md p-0 hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {getQuantity(ticket.id) >= 1 && (
                          <span className="text-xs text-green-600 drop-shadow-sm">
                            ✓ Added
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Individual checkout button */}
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    {isExpired ? (
                      <Button disabled variant="outline" className="w-full opacity-50">
                        {t('ticket-no-longer-available')}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 drop-shadow-sm">{t('or')}: </span>
                        <SingleCheckoutButton
                          stripePriceId={stripePriceIdForUser}
                          stripeProductId={ticket.stripeProductId}
                          eventKeyName={eventKeyName}
                          userId={userId}
                          eventId={eventId}
                          buttonText="purchase-ticket-directly"
                          type={paymentTypeValue}
                          numberSession={ticket.payTotalNumber ?? undefined}
                          email={userInfo?.email || ''}
                          seatNumber={seatNumber}
                          eventTicketId={ticket.id}
                          mainUserPhone={userInfo?.phone || ''}
                          mainUserName={userInfo?.name || ''}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
