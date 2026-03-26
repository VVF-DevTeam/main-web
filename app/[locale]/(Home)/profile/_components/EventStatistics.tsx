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
  formResponses?: JsonValue
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

type FormResponse = {
  questionId: string
  question: string
  answer: string | string[]
  questionType: string
  required: boolean
  options: string[]
  /** 1-based index of the registration form this answer belongs to */
  formNumber?: number
}

type FormResponsesData = {
  responses: FormResponse[]
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
  const [activeTab, setActiveTab] = useState<'tickets' | 'answers'>('tickets')

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
      `/${locale}/profile?section=admin-edit-event&eventKeyName=${selectedEventKeyName}`
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
          <>
            {/* Tab Header */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'tickets'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    Tickets
                  </button>
                  <button
                    onClick={() => setActiveTab('answers')}
                    className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === 'answers'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    Answers
                  </button>
                </nav>
              </div>
            </div>

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

              {/* Right Side - Content */}
              <div className="lg:col-span-2">
                {activeTab === 'tickets' ? (
                  <>
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
                                  payment.guestEmail || payment.user?.email || '-'
                                const displayPhone =
                                  payment.guestPhone || payment.user?.phone || '-'
                                const displayName =
                                  payment.guestName || payment.user?.name || '-'
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
                                        <td colSpan={9} className="px-4">
                                          <div className="ml-8">
                                            <table className="w-full text-sm">
                                              <tbody>
                                                {otherGuestsList.map((guest, index) => (
                                                  <tr
                                                    key={`${payment.id}-guest-${index}`}
                                                    className="border-b border-gray-200 last:border-0"
                                                  >
                                                    <td className="px-4 py-2 font-medium text-gray-700">
                                                      Guest {index + 1}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-700">{guest?.email || '-'}</td>
                                                    <td className="px-4 py-2 text-gray-700">{guest?.phone || '-'}</td>
                                                    <td className="px-4 py-2 text-gray-700">{guest?.name || '-'}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
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
                  </>
                ) : (
                  // Answers Tab
                  <div className="rounded-lg border bg-white shadow-sm">
                    <h3 className="border-b px-4 py-3 text-lg font-semibold">
                      Form Responses
                    </h3>
                    <div className="p-4">
                      {loading ? (
                        <div className="flex items-center justify-center p-8">
                          <p>Loading...</p>
                        </div>
                      ) : payments.length > 0 ? (
                        <FormResponsesView payments={payments} />
                      ) : (
                        <div className="flex items-center justify-center p-8">
                          <p className="text-muted-foreground">
                            No form responses found for this event
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
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

type QuestionAggregate = {
  question: string
  questionType: string
  required: boolean
  options: string[]
  responses: Array<{
    paymentId: string
    customerName: string
    customerEmail: string
    answer: string | string[]
  }>
}

// Component to display form responses grouped by form number, then by question
function FormResponsesView({ payments }: { payments: Payment[] }) {
  const byFormNumber = new Map<number, Map<string, QuestionAggregate>>()

  payments.forEach((payment) => {
    if (!payment.formResponses) return

    const formData = payment.formResponses as FormResponsesData
    if (!formData.responses || !Array.isArray(formData.responses)) return
    console.log(formData)
    const customerName =
      payment.guestName || payment.user?.name || 'Unknown'
    const customerEmail =
      payment.guestEmail || payment.user?.email || 'Unknown'

    formData.responses.forEach((response: FormResponse) => {
      const formNumber =
        typeof response.formNumber === 'number' && response.formNumber > 0
          ? response.formNumber
          : 1

      if (!byFormNumber.has(formNumber)) {
        byFormNumber.set(formNumber, new Map())
      }
      const questionMap = byFormNumber.get(formNumber)!

      if (!questionMap.has(response.questionId)) {
        questionMap.set(response.questionId, {
          question: response.question,
          questionType: response.questionType,
          required: response.required,
          options: response.options ?? [],
          responses: [],
        })
      }

      questionMap.get(response.questionId)!.responses.push({
        paymentId: payment.id,
        customerName,
        customerEmail,
        answer: response.answer,
      })
    })
  })

  const sortedFormNumbers = Array.from(byFormNumber.keys()).sort(
    (a, b) => a - b
  )

  if (sortedFormNumbers.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No form responses available
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {sortedFormNumbers.map((formNumber) => {
        const questionMap = byFormNumber.get(formNumber)!
        return (
          <section key={formNumber} className="space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Form {formNumber}
              </h3>
            </div>
            <div className="space-y-8">
              {Array.from(questionMap.entries()).map(([questionId, data]) => (
                <div key={questionId} className="border-b pb-6 last:border-0">
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-gray-900">
                      {data.question}
                      {data.required && (
                        <span className="ml-2 text-xs text-red-500">
                          *Required
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {data.questionType.replace('_', ' ')}
                      {data.options.length > 0 &&
                        ` • Options: ${data.options.join(', ')}`}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300 bg-gray-50">
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Customer Name
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700 hidden md:table-cell">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">
                            Answer
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.responses.map((response, index) => (
                          <tr
                            key={`${response.paymentId}-${index}`}
                            className="border-b border-gray-200 last:border-0"
                          >
                            <td className="px-4 py-3 text-gray-700">
                              {response.customerName}
                            </td>
                            <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                              {response.customerEmail}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {renderAnswer(
                                response.answer,
                                data.questionType
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {(data.questionType === 'single_choice' ||
                    data.questionType === 'multi_choice') &&
                    (() => {
                      const summary = getSummary(
                        data.responses,
                        data.questionType
                      )
                      if (summary.length === 0) return null
                      const total = summary.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )
                      return (
                        <div className="mt-3 rounded-md bg-blue-50 p-3">
                          <p className="text-xs font-semibold text-blue-900 mb-2">
                            Summary:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {summary.map((item, idx) => {
                              const percentage = (
                                (item.count / total) *
                                100
                              ).toFixed(1)
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                                >
                                  {item.value}: {item.count} ({percentage}%)
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// Helper function to render answer based on question type
function renderAnswer(
  answer: string | string[],
  questionType: string
): React.ReactNode {
  if (!answer) return <span className="text-gray-400 italic">No answer</span>
  if (Array.isArray(answer) && answer.length === 0) {
    return <span className="text-gray-400 italic">No answer</span>
  }

  const answerString = Array.isArray(answer) ? answer[0] : answer

  switch (questionType) {
    case 'date':
      try {
        const date = new Date(answerString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } catch {
        return answerString
      }
    case 'multi_choice':
      const CUSTOM_INPUT_TOKEN = ':$customInput$'
      const items = Array.isArray(answer)
        ? answer
        : answer.split(',').map((s) => s.trim()).filter(Boolean)
      return (
        <div className="flex flex-wrap gap-1">
          {items.map((item, idx) => {
            const customTokenIdx = item.indexOf(CUSTOM_INPUT_TOKEN)
            if (customTokenIdx !== -1) {
              const baseLabel = item.slice(0, customTokenIdx)
              const tokenEndIdx = customTokenIdx + CUSTOM_INPUT_TOKEN.length
              const remainder = item.slice(tokenEndIdx) // expected ":'...'"

              if (remainder.startsWith(":'") && remainder.endsWith("'")) {
                const userText = remainder.slice(2, -1)
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                  >
                    {baseLabel}: {userText}
                  </span>
                )
              }

              // Token-only custom selection (no typed text)
              return (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
                >
                  {baseLabel}
                </span>
              )
            }

            return (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
              >
                {item.trim()}
              </span>
            )
          })}
        </div>
      )
    case 'long_text':
      return <div className="whitespace-pre-wrap">{answerString}</div>
    default:
      return answerString
  }
}

// Helper function to get summary for choice questions
function getSummary(
  responses: Array<{ answer: string | string[] }>,
  questionType: string
): Array<{ value: string; count: number }> {
  const countMap = new Map<string, number>()

  responses.forEach((response) => {
    if (questionType === 'multi_choice') {
      const CUSTOM_INPUT_TOKEN = ':$customInput$'
      const raw = response.answer
      const items = Array.isArray(raw)
        ? raw
        : raw.split(',').map((s) => s.trim()).filter(Boolean)

      // Count each selected option; for custom-input options, count by token-only value.
      items.forEach((item) => {
        const trimmed = typeof item === 'string' ? item.trim() : ''
        if (!trimmed) return

        const tokenIdx = trimmed.indexOf(CUSTOM_INPUT_TOKEN)
        const normalized =
          tokenIdx !== -1
            ? trimmed.slice(0, tokenIdx + CUSTOM_INPUT_TOKEN.length)
            : trimmed

        countMap.set(normalized, (countMap.get(normalized) || 0) + 1)
      })
    } else {
      // For single choice, count the whole answer
      const trimmed = Array.isArray(response.answer)
        ? ''
        : response.answer.trim()
      // Skip empty values
      if (trimmed) {
        countMap.set(trimmed, (countMap.get(trimmed) || 0) + 1)
      }
    }
  })

  return Array.from(countMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
}
