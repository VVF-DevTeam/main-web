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
import { EventTicket } from '@prisma/client'
interface PaymentOptionsProps {
  formLink: string
  eventKeyName: string
  eventId: string
  title: string
  userId: string
  email: string
  type: string
  loggedIn: boolean
  seatingMap?: SeatingMap | null
  tickets?: EventTicket[]
}

const calculateTicketDisplayPrice = (ticket: EventTicket | null): number | null => {
  if (!ticket) {
    return null
  }

  const basePrice = Number(ticket.price)

  if (Number.isNaN(basePrice)) {
    return null
  }

  if (ticket.payTotalNumber && ticket.payTotalNumber > 0) {
    return basePrice * ticket.payTotalNumber
  }

  return basePrice
}

type OptionType = 'checkout' | 'quick' | 'etransfer'

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  formLink,
  eventKeyName,
  eventId,
  title,
  userId,
  email,
  type,
  loggedIn,
  seatingMap,
  tickets = [],
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
      return 'text-red-700'
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
    }
  }

  const selectedTicket = useMemo(() => {
    if (!selectedSeat?.seat.ticketId) {
      return null
    }

    return tickets.find((ticket) => ticket.id === selectedSeat.seat.ticketId) ?? null
  }, [selectedSeat?.seat.ticketId, tickets])

  const selectedTicketDisplayPrice = useMemo(() => calculateTicketDisplayPrice(selectedTicket), [selectedTicket])
  const selectedTicketCurrency = selectedTicket?.currency || 'CAD'

  const renderSeatDetails = () => {
    if (!selectedSeat) return null

    const { seat, rowIndex, seatIndex } = selectedSeat
    const seatName = getSeatName(seat, rowIndex, seatIndex)
    const hasTicket = Boolean(seat.ticketId)
    const ticket = selectedTicket
    const displayPrice = hasTicket ? selectedTicketDisplayPrice : null
    const priceDisplay = hasTicket
      ? ticket && displayPrice !== null
        ? `${selectedTicketCurrency} $${displayPrice.toFixed(2)}${
            ticket.payTotalNumber
              ? ` (Full Event: ${ticket.payTotalNumber} sessions)`
              : ''
          }`
        : 'N/A'
      : 'N/A'
    const secondaryDetails = hasTicket
      ? ticket
        ? [
            { label: 'Ticket Type', value: seat.ticketType || 'N/A' },
            {
              label: 'Price',
              value: priceDisplay,
            },
            ...(ticket.payTotalNumber
              ? [
                  {
                    label: 'Sessions',
                    value: `${ticket.payTotalNumber}`,
                  },
                ]
              : []),
          ]
        : [{ label: 'Ticket', value: 'No ticket information available' }]
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

  // Extract row and column names from seat names in seatingMap
  const { rowNames, columnNames } = useMemo(() => {
    if (!seatingMap || seatingMap.length === 0) {
      return { rowNames: [], columnNames: [] }
    }

    // Helper function to parse seat name into row and column parts
    const parseSeatName = (seatName: string | undefined): { row: string; col: string } | null => {
      if (!seatName) return null
      
      // Try to match pattern: letters followed by numbers (e.g., "A1", "B12", "AA1")
      const match = seatName.match(/^([A-Za-z]+)(\d+)$/)
      if (match) {
        return { row: match[1].toUpperCase(), col: match[2] }
      }
      
      // Fallback: try to split at first digit
      const digitIndex = seatName.search(/\d/)
      if (digitIndex > 0) {
        return {
          row: seatName.substring(0, digitIndex).toUpperCase(),
          col: seatName.substring(digitIndex)
        }
      }
      
      return null
    }

    const extractedRowNames: string[] = []
    const extractedColumnNames: string[] = []

    // Extract row names from the first seat in each row
    for (let rowIndex = 0; rowIndex < seatingMap.length; rowIndex++) {
      const row = seatingMap[rowIndex]
      if (row && row.length > 0) {
        const firstSeat = row[0]
        const parsed = parseSeatName(firstSeat?.name)
        if (parsed) {
          extractedRowNames[rowIndex] = parsed.row
        } else {
          // Fallback to generated name
          extractedRowNames[rowIndex] = String.fromCharCode(65 + rowIndex)
        }
      } else {
        // Fallback to generated name
        extractedRowNames[rowIndex] = String.fromCharCode(65 + rowIndex)
      }
    }

    // Extract column names from the first seat in each column
    if (seatingMap[0]) {
      for (let colIndex = 0; colIndex < seatingMap[0].length; colIndex++) {
        const firstSeat = seatingMap[0][colIndex]
        const parsed = parseSeatName(firstSeat?.name)
        if (parsed) {
          extractedColumnNames[colIndex] = parsed.col
        } else {
          // Fallback to generated name
          extractedColumnNames[colIndex] = String(colIndex + 1)
        }
      }
    }

    return {
      rowNames: extractedRowNames,
      columnNames: extractedColumnNames,
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
        iconClass: 'text-red-700',
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
                {/* Show normal checkout for Class event */}
                <EventNormalCheckOut
                  formLink={formLink}
                  eventKeyName={eventKeyName}
                  userId={userId}
                  eventId={eventId}
                  tickets={tickets}
                  email={email}
                  type={type}
                />
              </div>
            ) : seatingMap && seatingMap.length > 0 ? (
              // Show seating map for Concert event
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
            {renderSeatDetails()}
            {selectedSeat?.seat.ticketId && selectedTicket ? (
              <EventNormalCheckOut
                formLink={formLink}
                eventKeyName={eventKeyName}
                userId={userId}
                eventId={eventId}
                tickets={[selectedTicket]}
                email={email}
                type={type}
                seatNumber={selectedSeat?.seat.name}
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
