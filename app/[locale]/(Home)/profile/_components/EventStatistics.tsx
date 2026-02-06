'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { FiCopy, FiMail, FiEdit, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import { ArrowUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getAllPublishedEvents,
  getEventsOfHost,
} from '@/lib/actions/event/getEvent'
import { getPublishedEventsForReviewsWithSearch } from '@/lib/actions/review/reviewActions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getEventPayments } from './getEventPayments'
import { PaymentMethod, PaymentType } from '@prisma/client'
import AddPaymentButton from './AddPaymentButton'
import { UserInfoProps } from '@/lib/types/userInfo'
import { JsonValue } from '@prisma/client/runtime/library'

type OtherGuestJson = {
  name?: string
  email?: string
  phone?: string
}

interface EventStatisticsProps {
  user: UserInfoProps
  locale: string
}

interface Event {
  id: string
  title: string
}

interface Payment {
  id: string
  pricePaid: number | { toString(): string; toNumber(): number }
  quantity: number
  seatNumber: string | null
  type: PaymentType
  method: PaymentMethod
  stripePaymentId: string | null
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  otherGuests?: JsonValue
  user: {
    name: string | null
    email: string
    phone: string | null
  } | null
  event: {
    title: string
    startDate: Date | null
    endDate: Date | null
    location: string | null
    keyName: string
  } | null
  eventTicket: {
    type: string
    capacityPerTicket: number
  } | null
}

export default function EventStatistics({
  user,
  locale,
}: EventStatisticsProps) {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [eventSearchTerm, setEventSearchTerm] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    column: 'ticketName' | 'email' | 'phone' | 'customer' | 'paymentMethod' | null
    order: 'asc' | 'desc' | null
  }>({ column: null, order: null })
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})

  // Initialize from URL params if present
  useEffect(() => {
    const eventIdFromUrl = searchParams.get('eventId')
    if (eventIdFromUrl) {
      setSelectedEventId(eventIdFromUrl)
    }
  }, [searchParams])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user.role.includes('ADMIN')) {
          const publishedEvents = await getAllPublishedEvents()
          setEvents(publishedEvents)
          setFilteredEvents(publishedEvents)
        } else if (user.role.includes('HOST')) {
          const eventsOfHost = await getEventsOfHost(user.id)
          setEvents(eventsOfHost)
          setFilteredEvents(eventsOfHost)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }
    fetchEvents()
  }, [user.id, user.role])

  // Helper to fetch payments for the currently selected event
  const reloadPayments = useCallback(async () => {
    if (!selectedEventId) return
    setLoading(true)
    try {
      const eventPayments = await getEventPayments(selectedEventId)
      setPayments(eventPayments)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load event payments')
    } finally {
      setLoading(false)
    }
  }, [selectedEventId])

  // Fetch payments when event is selected
  useEffect(() => {
    if (selectedEventId) {
      reloadPayments()
    } else {
      setPayments([])
    }
  }, [selectedEventId, reloadPayments])

  // Default all payments with other guests to expanded
  useEffect(() => {
    const defaultExpanded: Record<string, boolean> = {}
    payments.forEach((payment) => {
      if (Array.isArray(payment.otherGuests) && payment.otherGuests.length > 0) {
        defaultExpanded[payment.id] = true
      }
    })
    setExpandedPayments(defaultExpanded)
  }, [payments])

  const handleEventSearch = async (searchTerm: string) => {
    if (searchTerm === '') {
      setFilteredEvents(events)
    } else {
      const filtered = await getPublishedEventsForReviewsWithSearch(
        searchTerm,
        15
      )
      setFilteredEvents(filtered)
    }
  }

  // Calculate statistics
  const totalParticipants = payments.reduce(
    (sum, payment) =>
      sum + payment.quantity * (payment.eventTicket?.capacityPerTicket ?? 1),
    0
  )
  const totalEarned = payments.reduce((sum, payment) => {
    const price =
      typeof payment.pricePaid === 'number'
        ? payment.pricePaid
        : Number(payment.pricePaid.toString())
    return sum + price
  }, 0)

  // Get unique emails for copy functionality (include guest emails)
  const participantEmails = Array.from(
    new Set(
      payments
        .map((p) => (p.user?.email || p.guestEmail)?.trim())
        .filter((email): email is string => !!email && email.length > 0)
        .concat(
          payments
            .map((p) => (p.otherGuests as OtherGuestJson[]).map((g) => g.email))
            .flat()
            .filter((email): email is string => !!email && email.length > 0)
        )
    )
  )

  const selectedEventKeyName = payments[0]?.event?.keyName

  const handleCopyEmails = async () => {
    if (participantEmails.length === 0) {
      toast.error('No participant emails found')
      return
    }

    const emailString = participantEmails.join(', ')
    try {
      await navigator.clipboard.writeText(emailString)
      toast.success('Emails copied to clipboard', {
        description: `${participantEmails.length} email(s) copied`,
        style: { color: '#22c55e' },
      })
    } catch (error) {
      toast.error('Failed to copy emails to clipboard')
    }
  }

  const handleSendEmail = () => {
    if (!selectedEventId) {
      toast.error('Please select an event first')
      return
    }
    router.push(
      `/${locale}/profile?section=admin-email-composition&eventId=${selectedEventId}`
    )
  }

  const handleManageEvent = () => {
    if (!selectedEventKeyName) {
      toast.error('Event key name not found')
      return
    }
    router.push(
      `/${locale}/profile?section=admin-edit-event&eventId=${selectedEventKeyName}`
    )
  }

  const handleSort = (column: 'ticketName' | 'email' | 'phone' | 'customer' | 'paymentMethod') => {
    if (sortConfig.column === column) {
      // Toggle through: asc -> desc -> null
      if (sortConfig.order === 'asc') {
        setSortConfig({ column, order: 'desc' })
      } else if (sortConfig.order === 'desc') {
        setSortConfig({ column: null, order: null })
      } else {
        setSortConfig({ column, order: 'asc' })
      }
    } else {
      // New column, start with asc
      setSortConfig({ column, order: 'asc' })
    }
  }

  const togglePaymentRow = (paymentId: string) => {
    setExpandedPayments((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }))
  }

  // Sort payments based on the selected column
  const sortedPayments = [...payments].sort((a, b) => {
    if (sortConfig.column === null || sortConfig.order === null) return 0
    
    let valueA = ''
    let valueB = ''
    
    switch (sortConfig.column) {
      case 'ticketName':
        valueA = a.eventTicket?.type || ''
        valueB = b.eventTicket?.type || ''
        break
      case 'email':
        valueA = a.user?.email || a.guestEmail || ''
        valueB = b.user?.email || b.guestEmail || ''
        break
      case 'phone':
        valueA = a.user?.phone || a.guestPhone || ''
        valueB = b.user?.phone || b.guestPhone || ''
        break
      case 'customer':
        valueA = a.user?.name || a.guestName || ''
        valueB = b.user?.name || b.guestName || ''
        break
      case 'paymentMethod':
        valueA = a.method || ''
        valueB = b.method || ''
        break
    }
    
    if (sortConfig.order === 'asc') {
      return valueA.localeCompare(valueB)
    } else {
      return valueB.localeCompare(valueA)
    }
  })

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">{t('event-manager')}</h1>

        {/* Event Selector */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Select Event</label>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-full max-w-md border">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              <div className="pb-2">
                <Input
                  type="search"
                  autoComplete="off"
                  placeholder="Input value and press Enter to search"
                  value={eventSearchTerm}
                  onChange={(e) => {
                    setEventSearchTerm(e.target.value)
                  }}
                  onKeyDown={async (e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      await handleEventSearch(eventSearchTerm)
                    }
                  }}
                />
              </div>
              {filteredEvents.map((event: Event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEventId && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Side - Statistics */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Event Overview</h2>

                {/* Event Details */}
                {payments.length > 0 && payments[0]?.event && (
                  <div className="mb-6 space-y-2 border-b pb-4">
                    {payments[0].event.startDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Start Date
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(
                            payments[0].event.startDate
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    {payments[0].event.endDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          End Date
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(
                            payments[0].event.endDate
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    {payments[0].event.location && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="text-sm font-medium">
                          {payments[0].event.location}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Statistics */}
                <div className="mb-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Participants
                    </p>
                    <p className="text-2xl font-bold">{totalParticipants}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Earned
                    </p>
                    <p className="text-2xl font-bold">
                      ${totalEarned.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <AddPaymentButton
                    user={user}
                    preSelectedEventId={selectedEventId}
                    onPaymentAdded={reloadPayments}
                  />
                  <Button
                    onClick={handleSendEmail}
                    className="w-full"
                    variant="default"
                  >
                    <FiMail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button
                    onClick={handleCopyEmails}
                    className="w-full"
                    variant="outline"
                  >
                    <FiCopy className="mr-2 h-4 w-4" />
                    Copy Email List
                  </Button>
                  <Button
                    onClick={handleManageEvent}
                    className="w-full"
                    variant="outline"
                  >
                    <FiEdit className="mr-2 h-4 w-4" />
                    Manage Event
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - Table */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex items-center justify-center rounded-lg border bg-white p-8">
                  <p>Loading...</p>
                </div>
              ) : payments.length > 0 ? (
                <div className="rounded-lg border bg-white shadow-sm">
                  <h3 className="border-b px-4 py-3 text-lg font-semibold">
                    Sold Tickets Table
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th 
                            className="cursor-pointer px-4 py-3 text-left hover:bg-gray-200"
                            onClick={() => handleSort('ticketName')}
                          >
                            <div className="flex items-center gap-2">
                              Ticket Name
                              {sortConfig.column !== 'ticketName' && <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0" />}
                              {sortConfig.column === 'ticketName' && sortConfig.order === 'asc' && <FiChevronUp className="h-3 w-3 text-blue-600 shrink-0" />}
                              {sortConfig.column === 'ticketName' && sortConfig.order === 'desc' && <FiChevronDown className="h-3 w-3 text-orange-600 shrink-0" />}
                            </div>
                          </th>
                          <th 
                            className="max-w-[110px] break-words cursor-pointer px-4 py-3 text-left hover:bg-gray-200"
                            onClick={() => handleSort('email')}
                          >
                            <div className="flex items-center gap-2">
                              Email
                              {sortConfig.column !== 'email' && <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0" />}
                              {sortConfig.column === 'email' && sortConfig.order === 'asc' && <FiChevronUp className="h-3 w-3 text-blue-600 shrink-0" />}
                              {sortConfig.column === 'email' && sortConfig.order === 'desc' && <FiChevronDown className="h-3 w-3 text-orange-600 shrink-0" />}
                            </div>
                          </th>
                          <th 
                            className="max-w-[110px] break-words cursor-pointer px-4 py-3 text-left hover:bg-gray-200"
                            onClick={() => handleSort('phone')}
                          >
                            <div className="flex items-center gap-2">
                              Phone Number
                              {sortConfig.column !== 'phone' && <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0" />}
                              {sortConfig.column === 'phone' && sortConfig.order === 'asc' && <FiChevronUp className="h-3 w-3 text-blue-600 shrink-0" />}
                              {sortConfig.column === 'phone' && sortConfig.order === 'desc' && <FiChevronDown className="h-3 w-3 text-orange-600 shrink-0" />}
                            </div>
                          </th>
                          <th 
                            className="max-w-[110px] break-words cursor-pointer px-4 py-3 text-left hover:bg-gray-200"
                            onClick={() => handleSort('customer')}
                          >
                            <div className="flex items-center gap-2">
                              Customer
                              {sortConfig.column !== 'customer' && <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0" />}
                              {sortConfig.column === 'customer' && sortConfig.order === 'asc' && <FiChevronUp className="h-3 w-3 text-blue-600 shrink-0" />}
                              {sortConfig.column === 'customer' && sortConfig.order === 'desc' && <FiChevronDown className="h-3 w-3 text-orange-600 shrink-0" />}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="max-w-[110px] break-words px-4 py-3 text-left">Quantity/Seat</th>
                          <th className="px-4 py-3 text-left">Capacity</th>
                          <th 
                            className="cursor-pointer px-4 py-3 text-left hover:bg-gray-200"
                            onClick={() => handleSort('paymentMethod')}
                          >
                            <div className="flex items-center gap-2">
                              Payment Method
                              {sortConfig.column !== 'paymentMethod' && <ArrowUpDown className="h-3 w-3 text-gray-400 shrink-0" />}
                              {sortConfig.column === 'paymentMethod' && sortConfig.order === 'asc' && <FiChevronUp className="h-3 w-3 text-blue-600 shrink-0" />}
                              {sortConfig.column === 'paymentMethod' && sortConfig.order === 'desc' && <FiChevronDown className="h-3 w-3 text-orange-600 shrink-0" />}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {sortedPayments.map((payment) => {
                          const isGuestCheckout =
                            !payment.user &&
                            (payment.guestEmail || payment.guestName)
                          const displayEmail =
                            payment.user?.email || payment.guestEmail || '-'
                          const displayPhone =
                            payment.user?.phone || payment.guestPhone || '-'
                          const displayName =
                            payment.user?.name || payment.guestName || '-'
                          const paymentType = payment.eventTicket?.type || '-'
                          const otherGuestsList = Array.isArray(payment.otherGuests)
                            ? (payment.otherGuests as OtherGuestJson[])
                            : []
                          const hasOtherGuests = otherGuestsList.length > 0
                          const isExpanded = hasOtherGuests
                            ? expandedPayments[payment.id] ?? true
                            : false

                          // Build display payment type with suffixes
                          let displayPaymentType = paymentType
                          if (isGuestCheckout) {
                            displayPaymentType += ' (Guest Checkout)'
                          }

                          return (
                            <Fragment key={payment.id}>
                              <tr
                                className={`bg-white ${hasOtherGuests ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                onClick={() => hasOtherGuests && togglePaymentRow(payment.id)}
                              >
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {hasOtherGuests && (
                                      isExpanded ? (
                                        <FiChevronUp className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <FiChevronDown className="h-4 w-4 text-gray-500" />
                                      )
                                    )}
                                    <span>{displayPaymentType}</span>
                                  </div>
                                </td>
                                <td className="max-w-[100px] whitespace-normal break-words px-4 py-3">
                                  {displayEmail}
                                </td>
                                <td className="max-w-[100px] whitespace-normal break-words px-4 py-3">{displayPhone}</td>
                                <td className="max-w-[100px] whitespace-normal break-words px-4 py-3">{displayName}</td>
                                <td className="px-4 py-3">
                                  $
                                  {(typeof payment.pricePaid === 'number'
                                    ? payment.pricePaid
                                    : Number(payment.pricePaid.toString())
                                  ).toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  {payment.quantity}/{payment.seatNumber || '-'}
                                </td>
                                <td className="px-4 py-3">
                                  {payment.eventTicket?.capacityPerTicket ?? 1}
                                </td>
                                <td className="px-4 py-3">
                                  {payment.method}
                                </td>
                              </tr>
                              {hasOtherGuests && isExpanded && (
                                <tr className="bg-gray-50">
                                  <td colSpan={8} className="px-12 py-3">
                                    <div className="space-y-2">
                                      {otherGuestsList.map((guest, index) => (
                                        <div
                                          key={`${payment.id}-guest-${index}`}
                                          className="flex flex-wrap gap-6 text-sm text-gray-700"
                                        >
                                          <span className="font-medium">
                                            Guest {index + 1}:
                                          </span>
                                          <span>{guest?.email || '-'}</span>
                                          <span>{guest?.phone || '-'}</span>
                                          <span>{guest?.name || '-'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border bg-white p-8">
                  <p className="text-muted-foreground">
                    No payments found for this event
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedEventId && (
          <div className="flex items-center justify-center rounded-lg border bg-white p-12">
            <p className="text-muted-foreground">
              Please select an event to view statistics
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
