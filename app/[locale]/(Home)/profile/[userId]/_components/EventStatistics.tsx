'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { FiCopy, FiMail, FiEdit } from 'react-icons/fi'
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

interface EventStatisticsProps {
  user: {
    id: string
    role: string[]
    email: string
  }
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
  type: string
  guestName: string | null
  guestEmail: string | null
  user: {
    name: string | null
    email: string
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [eventSearchTerm, setEventSearchTerm] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)

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

  // Fetch payments when event is selected
  useEffect(() => {
    if (selectedEventId) {
      const fetchPayments = async () => {
        setLoading(true)
        try {
          const eventPayments = await getEventPayments(selectedEventId)
          console.log(eventPayments)
          setPayments(eventPayments)
        } catch (error) {
          console.error('Error fetching payments:', error)
          toast.error('Failed to load event payments')
        } finally {
          setLoading(false)
        }
      }
      fetchPayments()
    } else {
      setPayments([])
    }
  }, [selectedEventId])

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
        .map((p) => p.user?.email || p.guestEmail)
        .filter((email): email is string => !!email)
    )
  )

  const selectedEvent = events.find((e) => e.id === selectedEventId)
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
      `/${locale}/profile/${user.id}?section=admin-email-composition&eventId=${selectedEventId}`
    )
  }

  const handleManageEvent = () => {
    if (!selectedEventKeyName) {
      toast.error('Event key name not found')
      return
    }
    router.push(
      `/${locale}/profile/${user.id}?section=admin-edit-event&eventId=${selectedEventKeyName}`
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Event Manager</h1>

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
                  placeholder="Search for event (if not shown in list)"
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
                          <th className="px-4 py-3 text-left">Ticket Name</th>
                          <th className="max-w-[150px] break-words px-4 py-3 text-left">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left">Customer</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Quantity/Seat</th>
                          <th className="px-4 py-3 text-left">Capacity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.map((payment) => {
                          const isGuestCheckout = !payment.user && (payment.guestEmail || payment.guestName)
                          const displayEmail = payment.user?.email || payment.guestEmail || '-'
                          const displayName = payment.user?.name || payment.guestName || '-'
                          const paymentType = payment.eventTicket?.type || '-'
                          const displayPaymentType = isGuestCheckout 
                            ? `${paymentType} (Guest Checkout)`
                            : paymentType

                          return (
                            <tr key={payment.id} className="bg-white">
                              <td className="px-4 py-3">
                                {displayPaymentType}
                              </td>
                              <td className="max-w-[150px] whitespace-normal break-words px-4 py-3">
                                {displayEmail}
                              </td>
                              <td className="px-4 py-3">
                                {displayName}
                              </td>
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
                            </tr>
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
