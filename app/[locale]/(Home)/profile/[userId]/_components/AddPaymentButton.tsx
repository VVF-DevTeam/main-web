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
import { useRouter } from 'next/navigation'

const addPaymentSchema = z
  .object({
    eventId: z.string().min(1, 'This field is required'),
    userId: z.string().min(1, 'User is required'),
    pricePaid: z.number().min(1, 'Price must be greater than 0'),
    quantity: z.number().min(1, 'Quantity must be greater than 0'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    paymentType: z.string().min(1, 'Payment type is required'),
    membershipEndDate: z
      .date()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.paymentType === 'Membership') {
        return data.eventId === 'none'
      }
      return true
    },
    {
      message: 'Event must be "None" for Membership payments',
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
          <button
            onClick={() => setShowAddClientModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
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
                    <FormLabel>Event</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select-an-event')} />
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

              {/* User */}
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="etf">E-transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank-transfer">
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
                          <SelectTrigger>
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

const AddPaymentButton = ({ user }: { user: UserInfoProps }) => {
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<UserInfoSimpleProps[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserInfoSimpleProps[]>([])
  const [searchTerm, setSearchTerm] = useState('')
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
      eventId: '',
      userId: '',
      pricePaid: 0,
      quantity: 0,
      paymentMethod: '',
      paymentType: '',
      membershipEndDate: new Date(),
    },
  })

  // onSubmit
  const onSubmit = async (data: AddPaymentFormValues) => {
    const { success, message } = await addPayment(data)
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
        />
      )}
    </>
  )
}

export default AddPaymentButton
