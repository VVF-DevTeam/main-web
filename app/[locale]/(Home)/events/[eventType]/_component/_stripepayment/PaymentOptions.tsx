'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EventNormalCheckOut from './EventNormalCheckOut'
// import EventQuickCheckout from './EventQuickCheckout'
import { Button } from '@/components/ui/button'
import { ChevronRight, Armchair } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { SeatingMap, SeatValue} from '../../../(Admin)/editEvent/[eventId]/_components/EventSeating'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  SEAT_STATUS,
  SEAT_STATUS_USER,
} from '../../../(Admin)/editEvent/[eventId]/_components/EventSeating'
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
  const [isSeatSheetOpen, setIsSeatSheetOpen] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState<{
    seat: SeatValue
    rowIndex: number
    seatIndex: number
  } | null>(null)
  const [ticketInfo, setTicketInfo] = useState<{
    stripePriceId: string | null
    stripeProductId: string | null
    price: number | null
    currency: string | null
  } | null>(null)
  const [isTicketInfoLoading, setIsTicketInfoLoading] = useState(false)

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
      hash = (hash << 5) - hash + char
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
    if (seat.status === SEAT_STATUS.OCCUPIED) {
      return 'text-red-600'
    }
    if (seat.ticketId && seat.ticketType) {
      return getTicketColor(seat.ticketId, seat.ticketType)
    }
    return 'text-gray-400'
  }

  const getSeatTitle = (
    seat: SeatValue,
    rowIndex: number,
    colIndex: number
  ) => {
    const seatName = seat.name || generateSeatName(rowIndex, colIndex)

    if (seat.ticketType) {
      return `${seatName} - ${seat.ticketType}`
    }
    return `${seatName} - Empty seat`
  }

  const getSeatName = (seat: SeatValue, rowIndex: number, colIndex: number) => {
    if (seat.name) {
      return seat.name
    }
    return generateSeatName(rowIndex, colIndex)
  }

  const handleSeatClick = useCallback(
    (seat: SeatValue, rowIndex: number, seatIndex: number) => {
      setSelectedSeat({ seat, rowIndex, seatIndex })
      setIsSeatSheetOpen(true)
    },
    []
  )

  const handleSeatKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLDivElement>,
      seat: SeatValue,
      rowIndex: number,
      seatIndex: number
    ) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleSeatClick(seat, rowIndex, seatIndex)
      }
    },
    [handleSeatClick]
  )

  const handleSeatSheetOpenChange = (open: boolean) => {
    setIsSeatSheetOpen(open)
    if (!open) {
      setSelectedSeat(null)
      setTicketInfo(null)
    }
  }

  // Fetch ticket info when a seat with ticketId is selected
  useEffect(() => {
    if (!selectedSeat?.seat.ticketId) {
      setTicketInfo(null)
      return
    }

    let isCancelled = false

    const fetchTicketInfo = async () => {
      try {
        setIsTicketInfoLoading(true)
        setTicketInfo(null)
        const response = await fetch(
          `/api/events/tickets?ticketId=${selectedSeat.seat.ticketId}`,
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Failed to fetch ticket information')
        }

        const data: {
          stripePriceId?: string | null
          stripeProductId?: string | null
          price?: number | string | null
          currency?: string | null
        } = await response.json()

        if (!isCancelled) {
          const parsedPrice =
            data.price !== undefined && data.price !== null
              ? Number(data.price)
              : null
          setTicketInfo({
            stripePriceId: data.stripePriceId ?? null,
            stripeProductId: data.stripeProductId ?? null,
            price:
              parsedPrice !== null && !Number.isNaN(parsedPrice)
                ? parsedPrice
                : null,
            currency: data.currency ?? null,
          })

          console.log('ticketInfo', ticketInfo)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching ticket information:', error)
          setTicketInfo(null)
        }
      } finally {
        if (!isCancelled) {
          setIsTicketInfoLoading(false)
        }
      }
    }

    fetchTicketInfo()

    return () => {
      isCancelled = true
    }
  }, [selectedSeat?.seat.ticketId])

  const renderSeatDetails = () => {
    if (!selectedSeat) return null

    const { seat, rowIndex, seatIndex } = selectedSeat
    const seatName = getSeatName(seat, rowIndex, seatIndex)
    const priceDisplay =
      seat.ticketId && isTicketInfoLoading
        ? 'Loading...'
        : seat.ticketId && ticketInfo?.price && ticketInfo.price > 0
          ? `${ticketInfo.currency || 'CAD'} $${ticketInfo.price.toFixed(2)}`
          : 'N/A'
    const secondaryDetails = seat.ticketId
      ? [
          { label: 'Ticket Type', value: seat.ticketType || 'N/A' },
          { label: 'Ticket ID', value: seat.ticketId },
          {
            label: 'Price',
            value: priceDisplay,
          },
        ]
      : [{ label: 'Ticket', value: 'No ticket assigned' }]

    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Seat</p>
          <p className="text-lg font-semibold text-gray-900">{seatName}</p>
          <p className="text-sm text-gray-600">{`Row ${rowNames[rowIndex] || String.fromCharCode(65 + rowIndex)}, Seat ${columnNames[seatIndex] || String(seatIndex + 1)}`}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Status
          </p>
          <p className="text-sm font-medium capitalize text-gray-900">
            {SEAT_STATUS_USER[seat.status] || 'Unknown'}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Details
          </p>
          <dl className="space-y-2 text-sm text-gray-700">
            {secondaryDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <dt className="font-medium text-gray-600">{item.label}</dt>
                <dd className="text-right text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }

  // Generate row and column names
  const { rowNames, columnNames } = useMemo(() => {
    if (!seatingMap || seatingMap.length === 0) {
      return { rowNames: [], columnNames: [] }
    }
    const rows = seatingMap.length
    const cols = seatingMap[0]?.length || 0
    return {
      rowNames: Array(rows)
        .fill(null)
        .map((_, i) => String.fromCharCode(65 + i)),
      columnNames: Array(cols)
        .fill(null)
        .map((_, i) => String(i + 1)),
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
    // No quick check out option for Concert
    { id: 'checkout', label: 'normal-checkout' },
    { id: 'etransfer', label: 'E-transfer' },
  ]

  const seatLegendItems = useMemo(
    () => [
      {
        key: 'available',
        label: SEAT_STATUS_USER[SEAT_STATUS.HAS_SEAT] || 'Available Seat',
        description:
          'Seat is available to select. Different color means different ticket type.',
        iconClass: 'text-blue-600',
      },
      {
        key: 'reserved',
        label: SEAT_STATUS_USER[SEAT_STATUS.OCCUPIED] || 'Reserved Seat',
        description: 'Seat has already been reserved.',
        iconClass: 'text-red-600',
      },
      {
        key: 'selected',
        label: 'Selected Seat',
        description: 'Seat you have currently selected.',
        iconClass: 'text-blue-600',
        wrapperClass: 'bg-gray-200 rounded',
      },
    ],
    []
  )

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
                    <div className="inline-block rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
                      {/* Stage */}
                      <div className="mb-4 flex justify-center">
                        <div className="flex items-center justify-center rounded-md border-2 border-amber-600 bg-amber-100 px-6 py-3">
                          <span className="text-sm font-semibold text-amber-900">
                            STAGE
                          </span>
                        </div>
                      </div>
                      {/* Divider */}
                      <div className="mb-4 flex justify-center">
                        <div className="h-px w-full bg-gray-400"></div>
                      </div>
                      {/* Seating */}
                      <div className="flex flex-col gap-2">
                        {/* Column Headers */}
                        <div className="flex justify-center gap-2">
                          <div className="h-8 w-8 flex-shrink-0"></div>
                          {seatingMap[0]?.map((_, colIndex) => (
                            <div
                              key={colIndex}
                              className="flex h-8 w-8 items-center justify-center text-xs font-semibold text-gray-700"
                            >
                              {columnNames[colIndex] || String(colIndex + 1)}
                            </div>
                          ))}
                        </div>
                        {/* Rows with Row Labels */}
                        {seatingMap.map((row, rowIndex) => (
                          <div
                            key={rowIndex}
                            className="flex justify-center gap-2"
                          >
                            {/* Row Label */}
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xs font-semibold text-gray-700">
                              {rowNames[rowIndex] ||
                                String.fromCharCode(65 + rowIndex)}
                            </div>
                            {/* Seats */}
                            {row.map((seat, seatIndex) => {
                              const isActiveSeat =
                                selectedSeat?.rowIndex === rowIndex &&
                                selectedSeat?.seatIndex === seatIndex
                              const isSeatUnavailable =
                                seat.status === SEAT_STATUS.OCCUPIED
                              return (
                                <div
                                  key={seatIndex}
                                  role="button"
                                  tabIndex={isSeatUnavailable ? -1 : 0}
                                  aria-pressed={isActiveSeat}
                                  aria-disabled={isSeatUnavailable}
                                  aria-label={getSeatTitle(
                                    seat,
                                    rowIndex,
                                    seatIndex
                                  )}
                                  onClick={() => {
                                    if (isSeatUnavailable) return
                                    handleSeatClick(seat, rowIndex, seatIndex)
                                  }}
                                  onKeyDown={
                                    isSeatUnavailable
                                      ? undefined
                                      : (event) =>
                                          handleSeatKeyDown(
                                            event,
                                            seat,
                                            rowIndex,
                                            seatIndex
                                          )
                                  }
                                  className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
                                    isSeatUnavailable
                                      ? 'cursor-not-allowed'
                                      : 'cursor-pointer hover:bg-gray-200/70',
                                    isActiveSeat ? 'bg-gray-200' : ''
                                  )}
                                  title={getSeatTitle(
                                    seat,
                                    rowIndex,
                                    seatIndex
                                  )}
                                >
                                  <Armchair
                                    className={cn(
                                      'h-6 w-6',
                                      getSeatColor(seat)
                                    )}
                                    strokeWidth={2}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Seat Legend
                    </h4>
                    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              Color
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              Meaning
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-600">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {seatLegendItems.map((item) => (
                            <tr key={item.key}>
                              <td className="px-3 py-3">
                                <div
                                  className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded',
                                    item.wrapperClass
                                  )}
                                >
                                  <Armchair
                                    className={cn('h-5 w-5', item.iconClass)}
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-3 text-gray-700">
                                {item.label}
                              </td>
                              <td className="px-3 py-3 text-gray-500">
                                {item.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )}

            {selected === 'etransfer' && (
              <div className="rounded border bg-white p-4 text-sm leading-relaxed dark:bg-gray-800">
                <p className="mb-2 font-semibold">
                  {t('etransfer-description')}
                </p>
                <ul className="ml-5 list-disc space-y-1">
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
                  <li>
                    {t('etransfer-description-1')}{' '}
                    <strong>finance@vietvibe.org</strong>
                  </li>
                  <li>
                    {t('etransfer-description-3')}: <strong>{title}</strong>,{' '}
                    {t('etransfer-description-3_5')}
                  </li>
                </ul>
                {/* <p className="pt-2 text-xs italic">
                  *{t('etransfer-description-7')}
                </p> */}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={isSeatSheetOpen} onOpenChange={handleSeatSheetOpenChange}>
        <SheetContent
          side="right"
          className="w-full max-w-md overflow-y-auto bg-white text-gray-900"
        >
          <SheetHeader>
            <SheetTitle>Seat Information</SheetTitle>
            <SheetDescription>
              {selectedSeat
                ? `Details for ${getSeatName(
                    selectedSeat.seat,
                    selectedSeat.rowIndex,
                    selectedSeat.seatIndex
                  )}.`
                : 'Select a seat to view its details.'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-4">
            {renderSeatDetails()}{' '}
            {isTicketInfoLoading ? (
              <Button disabled>Loading ticket information...</Button>
            ) : selectedSeat?.seat.ticketId && ticketInfo ? (
              <EventNormalCheckOut
                formLink={formLink}
                eventKeyName={eventKeyName}
                userId={userId}
                eventId={eventId}
                stripePriceId={ticketInfo.stripePriceId || undefined}
                stripeProductId={ticketInfo.stripeProductId || undefined}
                stripeSubscribedPriceId={stripeSubscribedPriceId}
                price={ticketInfo.price ?? price}
                fullCourseDiscount={fullCourseDiscount}
                email={email}
                type={type}
              />
            ) : selectedSeat?.seat.ticketId ? (
              <p className="text-sm text-red-600">
                Unable to load payment configuration for this ticket. Please try
                again later.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                No ticket assigned to this seat.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default PaymentOptions
