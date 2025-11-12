'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import EventNormalCheckOut from './EventNormalCheckOut'
import EventQuickCheckout from './EventQuickCheckout'
import { Button } from '@/components/ui/button'
import { ChevronRight, Armchair } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { SeatingMap } from '../../../(Admin)/editEvent/[eventId]/_components/EventSeating'
import { cn } from '@/lib/utils'
interface PaymentOptionsProps {
  stripePriceId: string
  stripeProductId: string
  stripeSubscribedPriceId: string
  formLink: string
  eventKeyName: string
  price: number
  eventId: string
  title: string
  userId: string
  fullCourseDiscount?: number
  email: string
  type: string
  loggedIn: boolean
  seatingMap?: SeatingMap | null
}

type OptionType = 'checkout' | 'quick' | 'etransfer'

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  stripePriceId,
  stripeProductId,
  stripeSubscribedPriceId,
  formLink,
  eventKeyName,
  price,
  eventId,
  title,
  userId,
  fullCourseDiscount,
  email,
  type,
  loggedIn,
  seatingMap,
}) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('event')
  const router = useRouter()
  const [selected, setSelected] = useState<OptionType>('checkout')
  const [showOptions, setShowOptions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevShowOptionsRef = useRef(false)

  // Helper functions for seating map display
  type SeatValue = { status: number } | { ticketType: string; ticketId: string; price: number; currency: string; name?: string; status: number }

  const generateSeatName = (rowIndex: number, colIndex: number) => {
    const rowName = String.fromCharCode(65 + rowIndex) // A, B, C, ...
    const colName = String(colIndex + 1)
    return `${rowName}${colName}`
  }

  const getTicketColor = (ticketId: string, ticketType: string): string => {
    const combined = `${ticketId}-${ticketType}`
    let hash = 0
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    const colors = [
      'text-blue-600',
      'text-green-600',
      'text-yellow-600',
      'text-purple-600',
      'text-orange-600',
      'text-pink-600',
      'text-red-600',
      'text-indigo-600',
      'text-amber-600',
      'text-fuchsia-600',
      'text-cyan-600',
      'text-lime-600',
    ]
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const getSeatColor = (seat: SeatValue) => {
    if ('ticketId' in seat && 'ticketType' in seat) {
      const ticketId = typeof seat.ticketId === 'string' ? seat.ticketId : ''
      const ticketType = typeof seat.ticketType === 'string' ? seat.ticketType : ''
      return getTicketColor(ticketId, ticketType)
    }
    return 'text-gray-400'
  }

  const getSeatTitle = (seat: SeatValue, rowIndex: number, colIndex: number) => {
    const seatName = 'name' in seat && typeof seat.name === 'string'
      ? seat.name
      : generateSeatName(rowIndex, colIndex)
    
    if ('ticketType' in seat && typeof seat.ticketType === 'string') {
      const currency = 'currency' in seat && typeof seat.currency === 'string' ? seat.currency : 'CAD'
      const price = 'price' in seat && typeof seat.price === 'number' 
        ? ` - ${currency} $${seat.price.toFixed(2)}` 
        : ''
      return `${seatName} - ${seat.ticketType}${price}`
    }
    return `${seatName} - Empty seat`
  }

  // Generate row and column names
  const { rowNames, columnNames } = useMemo(() => {
    if (!seatingMap || seatingMap.length === 0) {
      return { rowNames: [], columnNames: [] }
    }
    const rows = seatingMap.length
    const cols = seatingMap[0]?.length || 0
    return {
      rowNames: Array(rows).fill(null).map((_, i) => String.fromCharCode(65 + i)),
      columnNames: Array(cols).fill(null).map((_, i) => String(i + 1)),
    }
  }, [seatingMap])

  useEffect(() => {
    if (showOptions && !prevShowOptionsRef.current && containerRef.current) {
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

      // Scroll to bottom after animation
      const timeoutId = setTimeout(() => {
        if (scrollableParent) {
          scrollableParent.scrollTo({
            top: scrollableParent.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 500) // Wait for animation to complete (400ms animation + 100ms buffer)

      prevShowOptionsRef.current = showOptions
      return () => clearTimeout(timeoutId)
    }
    prevShowOptionsRef.current = showOptions
  }, [showOptions])

  const options: { id: OptionType; label: string }[] = [
    { id: 'checkout', label: 'normal-checkout' },
    // only show quick checkout if not using formLink
    ...(!formLink && (!seatingMap || seatingMap.length === 0)
      ? [
          {
            id: 'quick' as OptionType,
            label: type === 'CLASS' ? 'quick-checkout-class' : 'quick-checkout',
          },
        ]
      : []),
    { id: 'etransfer', label: 'E-transfer' },
  ]

  return (
    <div ref={containerRef} className="w-full text-bgColor-black">
      {loggedIn ? (
        <Button
          variant="default"
          onClick={() => {
            const willOpen = !showOptions
            setShowOptions(willOpen)
            // Scroll is handled in useEffect when showOptions transitions to true
          }}
          className="mb-4 w-full font-semibold"
        >
          {t('reserve-here')}
          <ChevronRight
            className={`ml-2 h-5 w-5 transition-transform duration-300 ${showOptions ? 'rotate-90' : 'rotate-0'}`}
          />
        </Button>
      ) : (
        <Button
          variant="default"
          onClick={() => router.push('/signIn')}
          className="mb-4 w-full font-semibold"
        >
          {t('login-to-reserve')}
        </Button>
      )}

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="flex flex-col items-start gap-4 rounded-md bg-gray-50 p-4 shadow-inner dark:bg-gray-900"
          >
            <div className="flex flex-wrap gap-4">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  className={`rounded border px-4 py-2 font-medium transition-all ${
                    selected === option.id
                      ? 'bg-primary text-white shadow'
                      : 'border-gray-300 bg-white hover:bg-gray-100'
                  }`}
                >
                  {t(option.label)}
                </button>
              ))}
            </div>

            {selected === 'checkout' &&
            (!seatingMap || seatingMap.length === 0) ? (
              <div className="w-full">
                <EventNormalCheckOut
                  stripePriceId={stripePriceId}
                  stripeProductId={stripeProductId}
                  stripeSubscribedPriceId={stripeSubscribedPriceId}
                  formLink={formLink}
                  eventKeyName={eventKeyName}
                  userId={userId}
                  eventId={eventId}
                  price={price}
                  fullCourseDiscount={fullCourseDiscount}
                  email={email}
                  type={type}
                />
              </div>
            ) : seatingMap && seatingMap.length > 0 ? (
              <div className="w-full">
                <div className="rounded-md border bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold">Seating Map</h3>
                  <div className="overflow-x-auto">
                    <div className="inline-block rounded-lg border-2 border-gray-300 p-4 bg-gray-50">
                      {/* Stage */}
                      <div className="mb-4 flex justify-center">
                        <div className="flex items-center justify-center rounded-md border-2 border-amber-600 bg-amber-100 px-6 py-3">
                          <span className="text-sm font-semibold text-amber-900">STAGE</span>
                        </div>
                      </div>
                      {/* Divider */}
                      <div className="mb-4 flex justify-center">
                        <div className="h-px w-full bg-gray-400"></div>
                      </div>
                      {/* Seating */}
                      <div className="flex flex-col gap-2">
                        {/* Column Headers */}
                        <div className="flex gap-2 justify-center">
                          <div className="h-6 w-6 flex-shrink-0"></div>
                          {seatingMap[0]?.map((_, colIndex) => (
                            <div
                              key={colIndex}
                              className="flex h-6 w-6 items-center justify-center text-xs font-semibold text-gray-700"
                            >
                              {columnNames[colIndex] || String(colIndex + 1)}
                            </div>
                          ))}
                        </div>
                        {/* Rows with Row Labels */}
                        {seatingMap.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex gap-2 justify-center">
                            {/* Row Label */}
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-xs font-semibold text-gray-700">
                              {rowNames[rowIndex] || String.fromCharCode(65 + rowIndex)}
                            </div>
                            {/* Seats */}
                            {row.map((seat, seatIndex) => (
                              <div
                                key={seatIndex}
                                className="flex items-center justify-center"
                                title={getSeatTitle(seat, rowIndex, seatIndex)}
                              >
                                <Armchair
                                  className={cn('h-6 w-6', getSeatColor(seat))}
                                  strokeWidth={1.5}
                                  fill={'ticketId' in seat ? 'currentColor' : 'none'}
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )}
            {selected === 'quick' &&
              (!seatingMap || seatingMap.length === 0) && (
                <div className="w-full">
                  <EventQuickCheckout
                    price={price}
                    eventId={eventId}
                    userId={userId}
                    stripePriceId={stripePriceId}
                    stripeProductId={stripeProductId}
                    type={type}
                  />
                </div>
              )}
            {selected === 'etransfer' && (
              <div className="rounded border bg-white p-4 text-sm leading-relaxed dark:bg-gray-800">
                <p className="mb-2 font-semibold">
                  {t('etransfer-description')}
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    {t('etransfer-description-1')}{' '}
                    <strong>finance@vietvibe.org</strong>
                  </li>
                  <li>
                    {t('etransfer-description-2')}{' '}
                    <em>&quot;What is the event name?&quot;</em>,{' '}
                    {t('etransfer-description-6')}:{' '}
                    <em>&quot;{eventKeyName}&quot;</em>
                  </li>
                  <li>
                    {t('etransfer-description-3')}: <strong>{title}</strong>,{' '}
                    {t('etransfer-description-3_5')}
                  </li>
                  <li>
                    {t('etransfer-description-4')}{' '}
                    <Link
                      href="https://www.facebook.com/people/VIET-VIBE/61570910920072/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-textColor-blue hover:text-textColor-blue"
                    >
                      Facebook
                    </Link>
                    /
                    <Link
                      href="https://www.instagram.com/vietvibe.foundation/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-textColor-blue hover:text-textColor-blue"
                    >
                      Instagram
                    </Link>{' '}
                    {t('etransfer-description-5')}
                  </li>
                </ul>
                <p className="pt-2 text-xs italic">
                  *{t('etransfer-description-7')}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PaymentOptions
