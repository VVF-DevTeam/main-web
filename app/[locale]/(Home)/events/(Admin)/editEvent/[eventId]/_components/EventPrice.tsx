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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'
import { AxiosError } from 'axios'

interface EventPriceProps {
  event: Event & { tickets?: EventTicket[] }
}

interface StripeDataCreate {
  success: boolean
  productId: string
  priceId: string
  subscribedPriceId: string
}

interface StripeDataEdit {
  success: boolean
  newPriceId: string
  newSubscribedPriceId: string
}

interface StripeTicketDataCreate {
  success: boolean
  productId: string
  priceId: string
}

interface StripeTicketDataEdit {
  success: boolean
  newPriceId: string
}

// Schema for Event-level pricing
const EventPriceSchema = z.object({
  price: z.coerce.number().min(0, 'Price must be at least 0'),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  subscribedPriceId: z.string().optional(),
})

// Schema for EventTicket
const EventTicketSchema = z.object({
  type: z.string().min(1, 'Ticket type is required'),
  price: z.coerce.number().min(0, 'Price must be at least 0'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  currency: z.string().default('CAD'),
  validFrom: z.date().optional().nullable(),
  validTo: z.date().optional().nullable(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
})

type EventPriceFormData = z.infer<typeof EventPriceSchema>
type EventTicketFormData = z.infer<typeof EventTicketSchema>

const EventPrice = ({ event }: EventPriceProps) => {
  const router = useRouter()
  const [editingPrice, setEditingPrice] = useState(false)
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [useTickets, setUseTickets] = useState((event.tickets?.length || 0) > 0)
  const currentDateTime = getCurrentDateTime()
  const tickets = event.tickets || []

  // Form for Event-level pricing
  const eventPriceForm = useForm<EventPriceFormData>({
    resolver: zodResolver(EventPriceSchema),
    defaultValues: {
      price: event?.price ? Number(event.price) : 0,
      stripeProductId: event.stripeProductId || undefined,
      stripePriceId: event.stripePriceId || undefined,
      subscribedPriceId: event.subscribedPriceId || undefined,
    },
  })

  // Form for EventTicket
  const ticketForm = useForm<EventTicketFormData>({
    resolver: zodResolver(EventTicketSchema),
    defaultValues: {
      type: '',
      price: 0,
      capacity: 1,
      currency: 'CAD',
      validFrom: null,
      validTo: null,
    },
  })

  const resetTicketForm = () => {
    ticketForm.reset({
      type: '',
      price: 0,
      capacity: 1,
      currency: 'CAD',
      validFrom: null,
      validTo: null,
    })
    setEditingTicketId(null)
    setIsAddingNew(false)
  }

  const loadTicketIntoForm = (ticket: EventTicket) => {
    ticketForm.reset({
      type: ticket.type,
      price: Number(ticket.price),
      capacity: ticket.capacity,
      currency: ticket.currency,
      validFrom: ticket.validFrom ? new Date(ticket.validFrom) : null,
      validTo: ticket.validTo ? new Date(ticket.validTo) : null,
      stripeProductId: ticket.stripeProductId,
      stripePriceId: ticket.stripePriceId,
    })
    setEditingTicketId(ticket.id)
    setIsAddingNew(false)
  }

  // Handle Event-level price submission
  const onEventPriceSubmit = async (values: EventPriceFormData) => {
    try {
      // Create or update price product in stripe
      if (!event.stripeProductId) {
        const { data } = await axiosInstance.post<StripeDataCreate>(
          '/api/payment/events',
          {
            eventId: event.id,
            eventUrl: `https://www.vietvibe.org/en/events/${event.eventType.toLowerCase()}/${event.keyName}`,
            price: values.price,
            title: event.title,
          }
        )
        values.stripeProductId = data.productId
        values.stripePriceId = data.priceId
        values.subscribedPriceId = data.subscribedPriceId
      } else {
        const { data } = await axiosInstance.put<StripeDataEdit>(
          '/api/payment/events',
          {
            eventUrl: `https://www.vietvibe.org/en/events/${event.eventType.toLowerCase()}/${event.keyName}`,
            eventId: event.id,
            price: values.price,
            stripeProductId: event.stripeProductId,
            stripePriceId: event.stripePriceId,
            subscribedPriceId: event.subscribedPriceId,
          }
        )

        values.stripePriceId = data.newPriceId
        values.subscribedPriceId = data.newSubscribedPriceId
      }

      // Update event with new price in database and stripeData
      await axiosInstance.put(`/api/events/edit/${event.id}`, values)
      setEditingPrice(false)
      toast.success('Event price updated successfully', {
        description: (
          <span style={{ color: "var(--muted-foreground)" }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data || error.message || 'An unknown error occurred'
        toast.error('Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
            </div>
          ),
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      } else if (error instanceof Error) {
        toast.error(error.message || 'Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Error</span>
              <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
            </div>
          ),
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
            </div>
          ),
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      }
    }
  }

  // Handle EventTicket submission
  const onTicketSubmit = async (values: EventTicketFormData) => {
    try {
      const ticketTitle = `${event.title} - ${values.type} Ticket`
      const eventUrl = `https://www.vietvibe.org/en/events/${event.eventType.toLowerCase()}/${event.keyName}`

      let stripeProductId = values.stripeProductId
      let stripePriceId = values.stripePriceId

      // Create or update Stripe product and price
      if (editingTicketId) {
        // Updating existing ticket
        if (!stripeProductId || !stripePriceId) {
          return toast.error('Missing Stripe product or price ID', {
            description: currentDateTime,
            style: { color: '#ef4444' },
          })
        }

        // Only update Stripe if price changed
        const existingTicket = tickets.find((t) => t.id === editingTicketId)
        if (existingTicket && Number(existingTicket.price) !== values.price) {
          const { data } = await axiosInstance.put<StripeTicketDataEdit>(
            '/api/payment/tickets',
            {
              eventId: event.id,
              eventUrl,
              title: ticketTitle,
              price: values.price,
              stripeProductId,
              stripePriceId,
              currency: values.currency,
            }
          )
          stripePriceId = data.newPriceId
        } else if (values.type !== existingTicket?.type) {
          // Update product name if type changed
          await axiosInstance.put('/api/payment/tickets', {
            eventId: event.id,
            eventUrl,
            title: ticketTitle,
            stripeProductId,
            stripePriceId,
          })
        }
      } else {
        // Creating new ticket
        const { data } = await axiosInstance.post<StripeTicketDataCreate>(
          '/api/payment/tickets',
          {
            eventId: event.id,
            eventUrl,
            title: ticketTitle,
            price: values.price,
            currency: values.currency,
          }
        )
        stripeProductId = data.productId
        stripePriceId = data.priceId
      }

      // Create or update ticket in database
      const ticketData = {
        eventId: event.id,
        type: values.type,
        price: values.price,
        capacity: values.capacity,
        currency: values.currency,
        validFrom: values.validFrom ? values.validFrom.toISOString() : null,
        validTo: values.validTo ? values.validTo.toISOString() : null,
        stripeProductId,
        stripePriceId,
      }

      if (editingTicketId) {
        await axiosInstance.put('/api/events/tickets', {
          id: editingTicketId,
          ...ticketData,
        })
        toast.success('Ticket updated successfully', {
          description: (
            <span style={{ color: "var(--muted-foreground)" }}>
              {currentDateTime}
            </span>
          ),
          style: { color: '#22c55e' },
        })
      } else {
        await axiosInstance.post('/api/events/tickets', ticketData)
        toast.success('Ticket created successfully', {
          description: (
            <span style={{ color: "var(--muted-foreground)" }}>
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
        const errorMessage =
          error.response?.data || error.message || 'An unknown error occurred'
        toast.error('Something went wrong', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: "var(--muted-foreground)" }}>
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
              <span style={{ color: "var(--muted-foreground)" }}>
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
              <span style={{ color: "var(--muted-foreground)" }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      }
    }
  }

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return
    }

    try {
      await axiosInstance.delete('/api/events/tickets', {
        data: { id: ticketId },
      })
      toast.success('Ticket deleted successfully', {
        description: (
          <span style={{ color: "var(--muted-foreground)" }}>
            {currentDateTime}
          </span>
        ),
        style: { color: '#22c55e' },
      })
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data || error.message || 'An unknown error occurred'
        toast.error('Failed to delete ticket', {
          description: (
            <div className="flex flex-col gap-1">
              <span>{errorMessage}</span>
              <span style={{ color: "var(--muted-foreground)" }}>
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
              <span style={{ color: "var(--muted-foreground)" }}>
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
              <span style={{ color: "var(--muted-foreground)" }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: { color: '#ef4444' },
        })
      }
    }
  }

  const { isSubmitting: isEventPriceSubmitting, isValid: isEventPriceValid } = eventPriceForm.formState
  const { isSubmitting: isTicketSubmitting, isValid: isTicketValid } = ticketForm.formState
  const isEditingTicket = editingTicketId !== null || isAddingNew

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Pricing</h1>
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <input
              type="checkbox"
              id="use-tickets"
              checked={useTickets}
              onChange={(e) => {
                setUseTickets(e.target.checked)
                if (!e.target.checked) {
                  setEditingTicketId(null)
                  setIsAddingNew(false)
                }
              }}
              className="h-4 w-4"
            />
            <label htmlFor="use-tickets" className="text-sm font-medium">
              Use Multiple Tickets
            </label>
          </div>
        </div>
      </div>

      {!useTickets ? (
        // Event-level pricing section
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Event Price</h2>
        <button
              onClick={() => setEditingPrice(!editingPrice)}
          className={cn(
            'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
                !editingPrice && 'text-[#C54B3E] hover:text-slate-700'
          )}
        >
              {editingPrice ? (
            <span>Cancel</span>
          ) : (
            <span className="flex items-center justify-center gap-x-2">
              Edit Price <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>

          {editingPrice ? (
            <Form {...eventPriceForm}>
          <form
                onSubmit={eventPriceForm.handleSubmit(onEventPriceSubmit)}
                className="space-y-4"
          >
            <FormField
                  control={eventPriceForm.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                      <FormLabel>Price</FormLabel>
                  <FormControl>
                        <Input type="number" step="0.01" placeholder="eg: 20" {...field} />
                  </FormControl>
                  <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Member price will be automatically set to 80% of this price
                      </p>
                </FormItem>
              )}
            />
                <Button disabled={isEventPriceSubmitting || !isEventPriceValid}>Save</Button>
          </form>
        </Form>
      ) : !event?.price ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add a price for this event.
        </p>
      ) : (
            <div className="flex flex-col gap-y-2">
        <div className="text-muted-foreground">
                Regular Price: ${Number(event.price).toFixed(2)}
              </div>
              {event.subscribedPriceId && (
                <div className="text-sm text-muted-foreground">
                  Member Price: ${(Number(event.price) * 0.8).toFixed(2)} (20% discount)
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // EventTickets section
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Event Tickets</h2>
            <div className="flex gap-x-2">
              {!isEditingTicket && (
                <button
                  onClick={() => {
                    resetTicketForm()
                    setIsAddingNew(true)
                  }}
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

          {/* Ticket List */}
          {!isEditingTicket && tickets.length > 0 && (
            <div className="flex flex-col gap-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-md border bg-white p-4"
                >
                  <div className="flex flex-col gap-y-1">
                    <div className="font-semibold">
                      {ticket.type} - ${Number(ticket.price).toFixed(2)}{' '}
                      {ticket.currency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Capacity: {ticket.capacity} | Sold: {ticket.sold}
                    </div>
                    {ticket.validFrom && ticket.validTo && (
                      <div className="text-xs text-muted-foreground">
                        Valid: {new Date(ticket.validFrom).toLocaleDateString()} -{' '}
                        {new Date(ticket.validTo).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-x-2">
                    <button
                      onClick={() => loadTicketIntoForm(ticket)}
                      className="rounded p-2 hover:bg-gray-100"
                      title="Edit ticket"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                      title="Delete ticket"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="eg: 100"
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
                          <FormControl>
                            <Input placeholder="eg: CAD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ticketForm.control}
                      name="validFrom"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Valid From (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col gap-2 w-full max-w-full">
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
                                  className="text-xs text-red-600 hover:underline self-start"
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

                    <FormField
                      control={ticketForm.control}
                      name="validTo"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Valid To (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col gap-2 w-full max-w-full">
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
                                  className="text-xs text-red-600 hover:underline self-start"
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
                  </div>

                  <div className="flex gap-x-2">
                    <Button type="submit" disabled={isTicketSubmitting || !isTicketValid}>
                      {editingTicketId ? 'Update Ticket' : 'Create Ticket'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetTicketForm}
                      disabled={isTicketSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
        </div>
          )}
        </>
      )}
    </div>
  )
}

export default EventPrice
