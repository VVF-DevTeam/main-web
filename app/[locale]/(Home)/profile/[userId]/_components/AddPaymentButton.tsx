'use client'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { PaymentType } from '@prisma/client'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getEventsOfHost,
  getAllPublishedEvents,
} from '@/lib/actions/event/getEvent'
import { getUsersSimple } from '@/lib/actions/user/getAllUsersSimple'
import { UserInfoProps, UserInfoSimpleProps } from '@/lib/types/userInfo'
import { Input } from '@/components/ui/input'
import { addPayment } from '@/lib/actions/payment/addPayment'
import { getEventTickets, EventTicket } from '@/lib/actions/ticket/getEventTickets'
import { useRouter } from 'next/navigation'

const addPaymentSchema = z
  .object({
    eventId: z.string().optional(),
    eventTicketId: z.string().optional(),
    userId: z.string().optional(),
    guestName: z.string().optional(),
    guestEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    guestPhone: z.string().optional(),
    pricePaid: z.number().optional(),
    quantity: z.number().min(1, 'Quantity must be greater than 0'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    paymentType: z.string().min(1, 'Payment type is required'),
    membershipEndDate: z
      .date()
      .optional(),
  })
  .refine(
    (data) => {
      // eventId is required for non-Membership payments
      if (data.paymentType !== 'Membership') {
        return data.eventId && data.eventId.trim() !== ''
      }
      return true
    },
    {
      message: 'Event is required for non-Membership payments',
      path: ['eventId'],
    }
  )
  .refine((data) => {
    if (data.paymentType === 'Membership') {
      return data.membershipEndDate && data.membershipEndDate > new Date()
    }
    return true
  }, {
    message: 'Membership end date must be in the future',
    path: ['membershipEndDate'],
  })
  .refine(
    (data) => {
      // Either userId must be provided OR guest name and email must be provided (phone is optional)
      const hasUserId = data.userId && data.userId.trim() !== '' && data.userId !== 'none-user'
      const hasGuestInfo = data.guestName && data.guestName.trim() !== '' && 
                          data.guestEmail && data.guestEmail.trim() !== ''
      return hasUserId || hasGuestInfo
    },
    {
      message: 'Either select an existing user to link with or provide guest information (name and email required)',
      path: ['userId'],
    }
  )
  .refine(
    (data) => {
      // Either eventTicketId OR pricePaid must be provided
      const hasTicket = data.eventTicketId && data.eventTicketId.trim() !== ''
      const hasPrice = data.pricePaid && data.pricePaid > 0
      return hasTicket || hasPrice
    },
    {
      message: 'Either select an event ticket or enter a price manually',
      path: ['pricePaid'],
    }
  )

// Event Interfaces
interface Event {
  id: string
  title: string
}

// Modal for adding a client
const AddClientModal = ({
  form,
  events,
  users,
  filteredUsers,
  setFilteredUsers,
  searchTerm,
  setSearchTerm,
  setShowAddClientModal,
  onSubmit,
  eventTickets,
  setEventTickets,
  preSelectedEventId,
}: {
  form: UseFormReturn<AddPaymentFormValues>
  events: Event[]
  users: UserInfoSimpleProps[]
  filteredUsers: UserInfoSimpleProps[]
  setFilteredUsers: (users: UserInfoSimpleProps[]) => void
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  setShowAddClientModal: (show: boolean) => void
  onSubmit: (data: AddPaymentFormValues) => void
  eventTickets: EventTicket[]
  setEventTickets: (tickets: EventTicket[]) => void
  preSelectedEventId?: string
}) => {
  // @ts-ignore: useTranslation will always throw an error for TypeScript
  const { t } = useTranslation('profile')

  // handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowAddClientModal(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Payment Record</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                form.reset()
                setEventTickets([])
              }}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Clear Form
            </button>
            <button
              onClick={() => setShowAddClientModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form for adding a client */}
        <Form {...form} key="add-payment-form">
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
              {/* Event */}
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Event{form.watch('paymentType') === 'Membership' ? ' (Optional)' : ''}
                      {preSelectedEventId && ' (Fixed)'}
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={async (value) => {
                          field.onChange(value)
                          // Fetch tickets for the selected event
                          if (value && value !== 'none') {
                            try {
                              const tickets = await getEventTickets(value)
                              setEventTickets(tickets)
                            } catch (error) {
                              console.error('Error fetching event tickets in AddPaymentButton:', error)
                              setEventTickets([])
                            }
                          } else {
                            setEventTickets([])
                          }
                          // Clear ticket selection when event changes
                          form.setValue('eventTicketId', '')
                        }}
                        disabled={!!preSelectedEventId}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder={
                              form.watch('paymentType') === 'Membership' 
                                ? 'Select an event (optional)'
                                : 'Select an event'
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {events.map((event: Event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Ticket (Optional) */}
              <FormField
                control={form.control}
                name="eventTicketId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Ticket (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Clear price when ticket is selected
                          if (value) {
                            form.setValue('pricePaid', 0)
                          }
                        }}
                        disabled={!form.watch('eventId') || form.watch('eventId') === 'none' || eventTickets.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder={
                              !form.watch('eventId') || form.watch('eventId') === 'none'
                                ? 'Select an event to see event ticket'
                                : eventTickets.length === 0 
                                ? 'No tickets available' 
                                : 'Select a ticket (or enter price manually)'
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTickets.map((ticket: EventTicket) => (
                            <SelectItem key={ticket.id} value={ticket.id}>
                              {ticket.type} - ${Number(ticket.price).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Paid */}
              <FormField
                control={form.control}
                name="pricePaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Paid (CAD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!!form.watch('eventTicketId')}
                        placeholder={form.watch('eventTicketId') ? 'Calculated from ticket' : 'Enter price manually'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* User */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link with existing User (Optional)</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                          }}
                          disabled={
                            !!form.watch('guestName') || 
                            !!form.watch('guestEmail') || 
                            !!form.watch('guestPhone')
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="border">
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none-user">None</SelectItem>
                            <div className="pb-2">
                              <Input
                                type="search"
                                autoComplete="off"
                                placeholder="Search for username (if not shown in list)"
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value)
                                }}
                                onKeyDown={async (e) => {
                                  e.stopPropagation()
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    if (searchTerm === '') {
                                      setFilteredUsers(users)
                                    } else {
                                      const filtered = await getUsersSimple({
                                        count: 15,
                                        nameSortString: searchTerm,
                                      })
                                      setFilteredUsers(filtered)
                                    }
                                  }
                                }}
                              />
                            </div>
                            {filteredUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Guest Name */}
              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Name (if user has no account)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter guest name"
                        disabled={!!form.watch('userId') && form.watch('userId') !== 'none-user'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Guest Email */}
              <FormField
                control={form.control}
                name="guestEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter guest email"
                        disabled={!!form.watch('userId') && form.watch('userId') !== 'none-user'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Guest Phone */}
              <FormField
                control={form.control}
                name="guestPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="Enter guest phone"
                        disabled={!!form.watch('userId') && form.watch('userId') !== 'none-user'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder="Select a payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ETF">E-transfer</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="BankTransfer">
                            Bank Transfer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Type */}
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)

                          if (value === 'Membership') {
                            form.setValue('eventId', 'none')
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder="Select an event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PaymentType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('paymentType') === 'Membership' && (
                <FormField
                  control={form.control}
                  name="membershipEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? field.value.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value + 'T00:00:00'))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>  

            {/* Submit Button */}
            <Button type="submit">
              Add Payment
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

type AddPaymentFormValues = z.infer<typeof addPaymentSchema>

interface AddPaymentButtonProps {
  user: UserInfoProps
  preSelectedEventId?: string // Optional: pre-select an event and disable event selection
}

const AddPaymentButton = ({ user, preSelectedEventId }: AddPaymentButtonProps) => {
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<UserInfoSimpleProps[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserInfoSimpleProps[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTickets, setEventTickets] = useState<EventTicket[]>([])
  const router = useRouter()
  // get events according to user role
  useEffect(() => {
    const fetchData = async () => {
      try {
        // get list of events for ADMIN (all events)
        if (user.role.includes('ADMIN')) {
          const publishedEvents = await getAllPublishedEvents()
          setEvents(publishedEvents)
        } else if (user.role.includes('HOST')) {
          const eventsOfHost = await getEventsOfHost(user.id)
          setEvents(eventsOfHost)
        }

        // get list of all users
        const allUsers = await getUsersSimple({
          count: 15,
        })
        setUsers(allUsers)
        setFilteredUsers(allUsers) // Initialize filtered users with all users
      } catch (error) {
        console.error('Error fetching data:', error)
        throw error
      }
    }

    fetchData()
  }, [])

  // Form
  const form = useForm<AddPaymentFormValues>({
    resolver: zodResolver(addPaymentSchema),
    defaultValues: {
      eventId: preSelectedEventId || '',
      eventTicketId: '',
      userId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      pricePaid: 0,
      quantity: 0,
      paymentMethod: '',
      paymentType: '',
      membershipEndDate: new Date(),
    },
  })

  // Load tickets for pre-selected event
  useEffect(() => {
    if (preSelectedEventId) {
      const loadTickets = async () => {
        try {
          const tickets = await getEventTickets(preSelectedEventId)
          setEventTickets(tickets)
        } catch (error) {
          console.error('Error fetching event tickets for pre-selected event:', error)
          setEventTickets([])
        }
      }
      loadTickets()
    }
  }, [preSelectedEventId])

  // onSubmit
  const onSubmit = async (data: AddPaymentFormValues) => {
    let pricePaid = 0
    
    // If eventTicketId is provided, calculate price from ticket
    if (data.eventTicketId && data.eventTicketId.trim() !== '') {
      const selectedTicket = eventTickets.find(ticket => ticket.id === data.eventTicketId)
      
      if (!selectedTicket) {
        toast.error('Error', {
          description: 'Please select a valid event ticket',
          style: {
            color: '#ef4444', // red-500 color
          },
        })
        return
      }
      
      pricePaid = selectedTicket.price * data.quantity
    } else {
      // Otherwise, use the manual pricePaid input
      pricePaid = data.pricePaid || 0
    }
    
    // Convert 'none-user' and 'none' eventId to undefined for the backend
    const submitData = {
      ...data,
      pricePaid,
      eventId: data.eventId === 'none' || !data.eventId ? undefined : data.eventId,
      userId: data.userId === 'none-user' ? undefined : data.userId,
      eventTicketId: data.eventTicketId || undefined,
    }
    
    const { success, message } = await addPayment(submitData)
    if (success) {
      toast.success('Success', {
        description: 'Payment added successfully',
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      setShowAddClientModal(false)
      form.reset()
      // Refresh the page data - addPayment already revalidates the cache
      router.refresh()
    } else {
      console.log(message)
      toast.error('Error', {
        description: 'Something went wrong',
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    }
  }

  return (
    <>
      <Button onClick={() => setShowAddClientModal(true)}>Add Payment</Button>
      {showAddClientModal && (
        <AddClientModal
          form={form}
          events={events}
          users={users}
          filteredUsers={filteredUsers}
          setFilteredUsers={setFilteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setShowAddClientModal={setShowAddClientModal}
          onSubmit={onSubmit}
          eventTickets={eventTickets}
          setEventTickets={setEventTickets}
          preSelectedEventId={preSelectedEventId}
        />
      )}
    </>
  )
}

export default AddPaymentButton
