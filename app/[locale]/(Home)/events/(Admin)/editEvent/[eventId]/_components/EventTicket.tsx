'use client'
import React, { useState } from 'react'
import { Event, EventTicket } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import DatePicker from '@/components/ui/DatePicker'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
import { axiosInstance } from '@/lib/axios'
import { AxiosError } from 'axios'
import Loader from '@/components/loader/Loader'

type TicketWithPayments = EventTicket & {
  payments: Array<{ quantity: number }>
}

interface EventTicketsProps {
  event: Event & {
    tickets?: TicketWithPayments[]
  }
}

interface StripeTicketDataCreate {
  success: boolean
  productId: string
  priceId: string
  subscribedPriceId: string
}

interface StripeTicketDataEdit {
  success: boolean
  newPriceId?: string
  newSubscriptionPriceId?: string
}

// Schema factory for EventTicket that includes event capacity validation
const createEventTicketSchema = (eventCapacity: number | null) =>
  z
    .object({
      type: z.string().min(1, 'Ticket type is required'),
      price: z.coerce.number().min(0, 'Price must be at least 0'),
      capacityPerTicket: z.coerce
        .number()
        .min(1, 'Capacity must be at least 1'),
      currency: z.string().default('CAD'),
      limit: z.coerce.number().min(1).optional().nullable(),
      discountMemberPercent: z.coerce
        .number()
        .min(0)
        .max(100)
        .optional()
        .nullable(),
      validFrom: z.date().optional().nullable(),
      validTo: z.date().optional().nullable(),
      stripeProductId: z.string().optional(),
      stripePriceId: z.string().optional(),
      subscribedStripePriceId: z.string().optional(),
      payTotalNumber: z.coerce.number().min(1).optional().nullable(),
      imageUrl: z
        .string()
        .optional()
        .nullable()
        .refine(
          (val) =>
            !val ||
            (typeof val === 'string' &&
              (val.trim() === '' || z.string().url().safeParse(val).success)),
          { message: 'Must be a valid URL' }
        ),
    })
    .refine(
      (data) => {
        // If payTotalNumber is provided, it must be at least 2 (multiple sessions)
        if (data.payTotalNumber !== null && data.payTotalNumber !== undefined) {
          return data.payTotalNumber >= 1
        }
        return true
      },
      {
        message:
          'Number of Sessions must be at least 2 for multiple session events',
        path: ['payTotalNumber'],
      }
    )
    .refine(
      (data) => {
        // If limit is provided and event capacity exists, limit cannot exceed event capacity
        if (
          data.limit !== null &&
          data.limit !== undefined &&
          eventCapacity !== null &&
          eventCapacity > 0
        ) {
          return data.limit <= eventCapacity
        }
        return true
      },
      {
        message: `Limit cannot exceed event capacity${eventCapacity ? ` (${eventCapacity})` : ''}`,
        path: ['limit'],
      }
    )

type EventTicketFormData = z.infer<ReturnType<typeof createEventTicketSchema>>

// Helper function to calculate sold count from payments
const calculateSoldCount = (payments: Array<{ quantity: number }>): number => {
  return payments.reduce((sum, payment) => sum + payment.quantity, 0)
}

const EventTickets = ({ event }: EventTicketsProps) => {
  const router = useRouter()
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isFullEvent, setIsFullEvent] = useState(false)
  const [showCapacityError, setShowCapacityError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const currentDateTime = getCurrentDateTime()
  const tickets = event.tickets || []

  // Form for EventTicket
  const ticketForm = useForm<EventTicketFormData>({
    resolver: zodResolver(createEventTicketSchema(event.capacity)),
    mode: 'all',
    defaultValues: {
      type: '',
      price: 0,
      capacityPerTicket: 1,
      currency: 'CAD',
      limit: null,
      discountMemberPercent: null,
      validFrom: null,
      validTo: null,
      payTotalNumber: null,
      imageUrl: null,
    },
  })

  const resetTicketForm = () => {
    ticketForm.reset({
      type: '',
      price: 0,
      capacityPerTicket: 1,
      currency: 'CAD',
      limit: null,
      discountMemberPercent: null,
      validFrom: null,
      validTo: null,
      payTotalNumber: null,
      imageUrl: null,
    })
    setEditingTicketId(null)
    setIsAddingNew(false)
    setIsFullEvent(false)
    setShowCapacityError(false)
  }

  const handleAddTicketClick = () => {
    // Check if event capacity is 0 or null
    if (!event.capacity || event.capacity === 0) {
      setShowCapacityError(true)
      return
    }
    // If capacity is set, proceed with adding ticket
    resetTicketForm()
    setIsAddingNew(true)
    setShowCapacityError(false)
  }

  const loadTicketIntoForm = (ticket: TicketWithPayments) => {
    const hasNumberOfSessions =
      ticket.payTotalNumber !== null &&
      ticket.payTotalNumber !== undefined &&
      ticket.payTotalNumber > 1

    console.log('hasNumberOfSessions', hasNumberOfSessions)
    console.log('ticket', ticket)
    console.log('ticketForm.formState.isValid', ticketForm.formState.isValid)
    console.log('ticketForm.formState.isSubmitting', ticketForm.formState.isSubmitting)

    ticketForm.reset(
      {
        type: ticket.type,
        price: Number(ticket.price),
        capacityPerTicket: ticket.capacityPerTicket,
        currency: ticket.currency,
        limit: ticket.limit ?? null,
        discountMemberPercent: ticket.discountMemberPercent ?? null,
        validFrom: ticket.validFrom ? new Date(ticket.validFrom) : null,
        validTo: ticket.validTo ? new Date(ticket.validTo) : null,
        stripeProductId: ticket.stripeProductId,
        stripePriceId: ticket.stripePriceId,
        subscribedStripePriceId: ticket.subscribedStripePriceId ?? undefined,
        payTotalNumber: ticket.payTotalNumber ?? null,
        imageUrl: ticket.imageUrl ?? null,
      },
      {
        keepDefaultValues: false,
      }
    )
    setIsFullEvent(hasNumberOfSessions)
    setEditingTicketId(ticket.id)
    setIsAddingNew(false)
  }

  // Handle EventTicket submission
  const onTicketSubmit = async (values: EventTicketFormData) => {
    try {
      setIsLoading(true)
      const ticketTitle = `${event.title} - ${values.type} Ticket`
      const eventUrl = `https://www.vietvibe.org/en/events/${event.eventType.toLowerCase()}/${event.keyName}`

      let stripeProductId = values.stripeProductId
      let stripePriceId = values.stripePriceId
      let subscribedStripePriceId = values.subscribedStripePriceId

      // Calculate Stripe price: use price * payTotalNumber * capacityPerTicket
      // If payTotalNumber is null/undefined, treat as 1 (single session)
      const sessions = values.payTotalNumber || 1
      const stripePrice = values.price * sessions * values.capacityPerTicket

      // Create or update Stripe product and price
      if (editingTicketId) {
        // Updating existing ticket
        if (!stripeProductId || !stripePriceId) {
          return toast.error('Missing Stripe product or price ID', {
            description: currentDateTime,
            style: { color: '#ef4444' },
          })
        }

        // Check if price, payTotalNumber, or discount changed
        const existingTicket = tickets.find((t) => t.id === editingTicketId)
        const existingStripePrice = existingTicket
          ? existingTicket.payTotalNumber
            ? Number(existingTicket.price) *
              existingTicket.payTotalNumber *
              existingTicket.capacityPerTicket
            : Number(existingTicket.price || 0) *
              existingTicket.capacityPerTicket
          : 0
        const priceChanged =
          existingTicket && existingStripePrice !== stripePrice
        const payTotalNumberChanged =
          existingTicket &&
          (existingTicket.payTotalNumber ?? null) !==
            (values.payTotalNumber ?? null)
        const discountChanged =
          existingTicket &&
          (existingTicket.discountMemberPercent ?? null) !==
            (values.discountMemberPercent ?? null)
        const typeChanged = values.type !== existingTicket?.type

        // Update Stripe if price, payTotalNumber, discount changed, or if type changed
        if (
          priceChanged ||
          payTotalNumberChanged ||
          discountChanged ||
          typeChanged
        ) {
          const { data } = await axiosInstance.put<StripeTicketDataEdit>(
            '/api/payment/tickets',
            {
              eventId: event.id,
              eventUrl,
              title: ticketTitle,
              price: stripePrice,
              stripeProductId,
              stripePriceId,
              stripeSubscriptionPriceId: subscribedStripePriceId,
              currency: values.currency,
              discountMemberPercent: values.discountMemberPercent ?? null,
            }
          )
          // Update price IDs if new ones were created
          if (data.newPriceId) {
            stripePriceId = data.newPriceId
          }
          if (data.newSubscriptionPriceId) {
            subscribedStripePriceId = data.newSubscriptionPriceId
          }
        }
      } else {
        // Creating new ticket
        const { data } = await axiosInstance.post<StripeTicketDataCreate>(
          '/api/payment/tickets',
          {
            eventId: event.id,
            eventUrl,
            title: ticketTitle,
            price: stripePrice,
            currency: values.currency,
            discountMemberPercent: values.discountMemberPercent ?? null,
          }
        )
        stripeProductId = data.productId
        stripePriceId = data.priceId
        subscribedStripePriceId = data.subscribedPriceId
      }

      // Create or update ticket in database
      const ticketData = {
        eventId: event.id,
        type: values.type,
        price: values.price,
        capacityPerTicket: values.capacityPerTicket,
        currency: values.currency,
        limit: values.limit ?? null,
        discountMemberPercent: values.discountMemberPercent ?? null,
        validFrom: values.validFrom ? values.validFrom.toISOString() : null,
        validTo: values.validTo ? values.validTo.toISOString() : null,
        stripeProductId,
        stripePriceId,
        subscribedStripePriceId,
        payTotalNumber:
          isFullEvent && values.payTotalNumber ? values.payTotalNumber : null,
        imageUrl:
          values.imageUrl && values.imageUrl.trim() !== ''
            ? values.imageUrl
            : null,
      }

      if (editingTicketId) {
        // Update ticket in database
        await axiosInstance.put('/api/events/tickets', {
          id: editingTicketId,
          ...ticketData,
        })

        toast.success('Ticket updated successfully', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: { color: '#22c55e' },
        })
      } else {
        const response = await axiosInstance.post(
          '/api/events/tickets',
          ticketData
        )
        const createdTicketId = response.data.id

        // Update Stripe product metadata with ticketId after ticket creation (one-time only)
        // Metadata is only set when the product is first created or immediately after ticket creation
        await axiosInstance.put('/api/payment/tickets', {
          eventId: event.id,
          eventUrl,
          title: ticketTitle,
          stripeProductId,
          ticketId: createdTicketId,
        })
        toast.success('Ticket created successfully', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: { color: '#22c55e' },
        })
      }

      resetTicketForm()
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // Extract error message from response data
        let errorMessage = 'An unknown error occurred'
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (
            typeof error.response.data === 'object' &&
            error.response.data !== null
          ) {
            // Handle error object with message property
            errorMessage =
              (error.response.data as { message?: string }).message ||
              JSON.stringify(error.response.data)
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        toast.error('Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else if (error instanceof Error) {
        toast.error(error.message || 'Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Error</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (ticketId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this ticket? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      setIsLoading(true)
      await axiosInstance.delete('/api/events/tickets', {
        data: { id: ticketId },
      })
      toast.success('Ticket deleted successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: { color: '#22c55e' },
      })
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        // Extract error message from response data
        let errorMessage = 'An unknown error occurred'
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (
            typeof error.response.data === 'object' &&
            error.response.data !== null
          ) {
            // Handle error object with message property
            errorMessage =
              (error.response.data as { message?: string }).message ||
              JSON.stringify(error.response.data)
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        toast.error('Failed to delete ticket', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete ticket', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Error</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const { isSubmitting: isTicketSubmitting, isValid: isTicketValid } =
    ticketForm.formState
  const isEditingTicket = editingTicketId !== null || isAddingNew

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      {/* EventTickets section */}
      <>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Event Tickets</h1>
          <div className="flex gap-x-2">
            {!isEditingTicket && (
              <button
                onClick={handleAddTicketClick}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-x-2 text-sm font-semibold text-[#C54B3E] transition-all hover:text-slate-700'
                )}
              >
                <Plus className="h-4 w-4" />
                Add Ticket
              </button>
            )}
          </div>
        </div>

        <p className="text-sm italic text-muted-foreground text-slate-500">
          NOTE 1: Avoid changing capacity after there are purchases, it may
          confuse the customers.
        </p>
        <p className="text-sm italic text-muted-foreground text-slate-500">
          NOTE 2: Ticket will be hidden after the Valid To date.
        </p>

        {/* Capacity Error Message */}
        {showCapacityError && !isEditingTicket && (
          <p className="text-sm font-medium text-red-600">
            Please add event capacity before adding tickets. Go to Step IV above
            to set it.
          </p>
        )}

        {/* Ticket List */}
        {!isEditingTicket && tickets.length > 0 && (
          <div className="flex flex-col gap-y-4">
            {tickets.map((ticket) => {
              // Calculate display price, payTotalNumber is number of session this ticket has
              const displayPrice =
                Number(ticket.price) *
                ticket.payTotalNumber *
                ticket.capacityPerTicket

              const soldCount = calculateSoldCount(ticket.payments || [])
              return (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-md border bg-white p-4"
                >
                  <div className="flex flex-col gap-y-1">
                    <div className="font-semibold">
                      {ticket.type} - ${displayPrice.toFixed(2)}{' '}
                      {ticket.currency}
                      {ticket.payTotalNumber && ticket.payTotalNumber > 1 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          {' '}
                          (Full Event: {ticket.payTotalNumber} sessions)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Capacity: {ticket.capacityPerTicket} | Sold: {soldCount}
                      {ticket.limit != null && ticket.limit > 0 && (
                        <> | Limit: {ticket.limit}</>
                      )}
                      {ticket.discountMemberPercent !== null && (
                        <> | Discount: {ticket.discountMemberPercent}%</>
                      )}
                    </div>
                    {ticket.validFrom && ticket.validTo && (
                      <div className="text-xs text-muted-foreground">
                        Valid: {new Date(ticket.validFrom).toLocaleDateString()}{' '}
                        - {new Date(ticket.validTo).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-x-2">
                    <button
                      onClick={() => loadTicketIntoForm(ticket)}
                      disabled={isLoading}
                      className="rounded p-2 hover:bg-gray-100"
                      title="Edit ticket"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      disabled={isLoading}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                      title="Delete ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!isEditingTicket && tickets.length === 0 && (
          <p className="text-sm italic text-muted-foreground text-slate-500">
            No tickets added yet. Click &quot;Add Ticket&quot; to create one.
          </p>
        )}

        {/* Add/Edit Ticket Form */}
        {isEditingTicket && (
          <div className="rounded-md border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingTicketId ? 'Edit Ticket' : 'Add New Ticket'}
              </h3>
              <button
                onClick={resetTicketForm}
                disabled={isLoading}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Form {...ticketForm}>
              <form
                onSubmit={ticketForm.handleSubmit(onTicketSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={ticketForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Type</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="eg: Non-Member, Member, Early Bird, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="eg: 25.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="capacityPerTicket"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Capacity (e.g. ticket for group of 5 will be 5,
                          default is 1 for single ticket)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="eg: 5 (for group of 5)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="VND">VND</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Limit (Optional)
                          {event.capacity && (
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              (Max: {event.capacity})
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="1"
                            max={event.capacity ?? undefined}
                            placeholder="eg: 100"
                            {...field}
                            value={field.value ?? ''}
                            onChange={async (e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? null : Number(value)
                              )
                              // Trigger validation after onChange
                              await ticketForm.trigger('limit')
                            }}
                            onBlur={async () => {
                              field.onBlur()
                              // Trigger validation on blur as well
                              await ticketForm.trigger('limit')
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Discount Percentage for Members */}
                  <FormField
                    control={ticketForm.control}
                    name="discountMemberPercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Discount Percentage for Members (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            placeholder="eg: 10"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? null : Number(value)
                              )
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valid From Date */}
                  <FormField
                    control={ticketForm.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Valid From (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex w-full max-w-full flex-col gap-2">
                            <div className="w-full max-w-full">
                              <DatePicker
                                value={field.value ?? undefined}
                                onChange={(date) => {
                                  field.onChange(date ?? null)
                                }}
                              />
                            </div>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(null)}
                                className="self-start text-xs text-red-600 hover:underline"
                              >
                                Clear date
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valid To Date */}
                  <FormField
                    control={ticketForm.control}
                    name="validTo"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Valid To (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex w-full max-w-full flex-col gap-2">
                            <div className="w-full max-w-full">
                              <DatePicker
                                value={field.value ?? undefined}
                                onChange={(date) => {
                                  field.onChange(date ?? null)
                                }}
                              />
                            </div>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(null)}
                                className="self-start text-xs text-red-600 hover:underline"
                              >
                                Clear date
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ticket Background Image URL */}
                  <FormField
                    control={ticketForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Ticket Background Image URL (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://drive.google.com/thumbnail?id=FILE_ID"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value === '' ? null : value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Full Event Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fullEvent"
                    checked={isFullEvent}
                    onCheckedChange={(checked) => {
                      setIsFullEvent(checked === true)
                      if (checked) {
                        // When checked, set to minimum of 2 sessions
                        ticketForm.setValue('payTotalNumber', 2, {
                          shouldValidate: true,
                        })
                      } else {
                        // When unchecked, set to null (single session)
                        ticketForm.setValue('payTotalNumber', null, {
                          shouldValidate: true,
                        })
                      }
                    }}
                  />
                  <label
                    htmlFor="fullEvent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Event with multiple sessions
                  </label>
                </div>

                {/* Pay Total Number Field - shown when Full Event is checked */}
                {isFullEvent && (
                  <FormField
                    control={ticketForm.control}
                    name="payTotalNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Sessions (Should be at least 2)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="2"
                            placeholder="eg: 5"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(
                                value === '' ? null : Number(value)
                              )
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-x-2">
                  <Button
                    type="submit"
                    disabled={isTicketSubmitting || !isTicketValid || isLoading}
                  >
                    {editingTicketId ? 'Update Ticket' : 'Create Ticket'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetTicketForm}
                    disabled={isTicketSubmitting || isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </>
    </div>
    </>
  )
}

export default EventTickets
