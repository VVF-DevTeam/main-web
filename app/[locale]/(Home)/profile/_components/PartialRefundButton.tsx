'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getAllPublishedEvents, getEventsOfHost } from '@/lib/actions/event/getEvent'
import { getEventPayments } from '@/lib/actions/payment/getEventPayments'
import { UserInfoProps } from '@/lib/types/userInfo'
import { axiosInstance } from '@/lib/axios'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Loader from '@/components/loader/Loader'

type EventOption = {
  id: string
  title: string
}

type PaymentOption = {
  paymentId: string
  email: string
  name: string | null
  originalAmount: number
  maxAmount: number
  createdAt: Date
}

type UserOption = {
  email: string
  name: string | null
}

const partialRefundSchema = z.object({
  eventId: z.string().min(1, 'Event is required'),
  userEmail: z.string().min(1, 'User is required'),
  paymentId: z.string().min(1, 'Payment is required'),
  refundAmount: z.coerce.number().positive('Refund amount must be greater than 0'),
  note: z.string().optional(),
})

type PartialRefundFormValues = z.infer<typeof partialRefundSchema>

export default function PartialRefundButton({ user }: { user: UserInfoProps }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState<EventOption[]>([])
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])
  const [userOptions, setUserOptions] = useState<UserOption[]>([])
  const router = useRouter()

  const form = useForm<PartialRefundFormValues>({
    resolver: zodResolver(partialRefundSchema),
    defaultValues: {
      eventId: '',
      userEmail: '',
      paymentId: '',
      refundAmount: 0,
      note: '',
    },
  })

  const selectedUserEmail = form.watch('userEmail')
  const selectedPaymentId = form.watch('paymentId')

  const paymentsForSelectedUser = useMemo(
    () => paymentOptions.filter((p) => p.email === selectedUserEmail),
    [paymentOptions, selectedUserEmail]
  )

  const selectedPayment = useMemo(
    () => paymentOptions.find((option) => option.paymentId === selectedPaymentId),
    [selectedPaymentId, paymentOptions]
  )

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user.role.includes('ADMIN') || user.role.includes('SUPERADMIN')) {
          const publishedEvents = await getAllPublishedEvents()
          setEvents(
            publishedEvents.map((event) => ({
              id: event.id,
              title: event.title,
            }))
          )
          return
        }

        if (user.role.includes('HOST')) {
          const hostEvents = await getEventsOfHost(user.id)
          setEvents(
            hostEvents.map((event) => ({
              id: event.id,
              title: event.title,
            }))
          )
        }
      } catch (error) {
        console.error('Error fetching events for partial refund:', error)
      }
    }

    fetchEvents()
  }, [user.id, user.role])

  const loadPaymentsByEvent = async (eventId: string) => {
    if (!eventId) {
      setPaymentOptions([])
      setUserOptions([])
      return
    }

    try {
      const eventPayments = await getEventPayments(eventId)
      const payments: PaymentOption[] = []
      const uniqueUsersByEmail = new Map<string, UserOption>()

      eventPayments.forEach((payment) => {
        if (!payment.stripePaymentId || payment.method !== 'Stripe') return

        const email = (payment.user?.email || payment.guestEmail || '').trim()
        if (!email) return
        const paidAmount = Number(payment.pricePaid)
        const refundedAmount =
          payment.totalRefundAmount == null ? 0 : Number(payment.totalRefundAmount)
        const remainingRefundableAmount = Math.max(paidAmount - refundedAmount, 0)

        payments.push({
          paymentId: payment.id,
          email,
          name: payment.user?.name || payment.guestName || null,
          originalAmount: paidAmount,
          maxAmount: remainingRefundableAmount,
          createdAt: new Date(payment.createdAt),
        })

        if (!uniqueUsersByEmail.has(email)) {
          uniqueUsersByEmail.set(email, {
            email,
            name: payment.user?.name || payment.guestName || null,
          })
        }
      })

      setPaymentOptions(payments)
      setUserOptions(Array.from(uniqueUsersByEmail.values()))
    } catch (error) {
      console.error('Error fetching payments by event for partial refund:', error)
      setPaymentOptions([])
      setUserOptions([])
    }
  }

  const onSubmit = async (data: PartialRefundFormValues) => {
    if (!selectedPayment) return

    if (data.refundAmount > selectedPayment.maxAmount) {
      form.setError('refundAmount', {
        type: 'manual',
        message: `Refund amount cannot exceed ${selectedPayment.maxAmount.toFixed(2)} CAD`,
      })
      return
    }

    try {
      setIsLoading(true)

      await axiosInstance.post('/api/payment/refund', {
        paymentId: data.paymentId,
        amount: data.refundAmount,
        monitorUserId: user.id,
        note: data.note?.trim() || undefined,
      })

      toast.success('Partial refund processed successfully', {
        description: `${data.refundAmount.toFixed(2)} CAD refunded to selected user`,
        style: { color: '#22c55e' },
      })

      setIsOpen(false)
      form.reset()
      setPaymentOptions([])
      setUserOptions([])
      router.refresh()
    } catch (error) {
      console.error('Partial refund error:', error)
      const apiErrorMessage =
        error instanceof AxiosError
          ? typeof error.response?.data === 'string'
            ? error.response.data
            : error.message
          : error instanceof Error
            ? error.message
            : 'Unknown error'

      toast.error(`Failed to process partial refund: ${apiErrorMessage}`, {
        description: 'Please contact team dev for assistance',
        style: { color: '#ef4444' },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <Button type="button" variant="default" onClick={() => setIsOpen(true)}>
        Partial Refund
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div
            className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Partial Refund</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-2xl leading-none text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground text-sm">
                NOTE: Refund takes up to 3 days to process. Please notice the client accordingly.
              </p>
            </div>

            <Form {...form}>
              <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="eventId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={async (value) => {
                              field.onChange(value)
                              form.setValue('userEmail', '')
                              form.setValue('paymentId', '')
                              await loadPaymentsByEvent(value)
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="border">
                                <SelectValue placeholder="Select an event" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {events.map((event) => (
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

                  <FormField
                    control={form.control}
                    name="refundAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="Enter refund amount (CAD)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>User</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value)
                              form.setValue('paymentId', '')
                            }}
                            disabled={!form.watch('eventId') || userOptions.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="border">
                                <SelectValue placeholder="Select a user from this event" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userOptions.map((option) => (
                                <SelectItem key={option.email} value={option.email}>
                                  {option.name ? `${option.name} — ${option.email}` : option.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Payment</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!selectedUserEmail || paymentsForSelectedUser.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="border">
                                <SelectValue placeholder="Select which payment to refund" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentsForSelectedUser.map((option) => (
                                <SelectItem key={option.paymentId} value={option.paymentId}>
                                  ${option.originalAmount.toFixed(2)} CAD — {option.originalAmount.toString()} — {' '}
                                  {(() => {
                                    const createdAtDate = new Date(option.createdAt)
                                    return Number.isNaN(createdAtDate.getTime())
                                      ? '-'
                                      : createdAtDate.toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        })
                                  })()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        {selectedPayment && (
                          <p className="text-muted-foreground text-xs">
                            Maximum refundable for this payment: {selectedPayment.maxAmount.toFixed(2)} CAD
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (Optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} placeholder="Add any notes about this refund" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  Process Partial Refund
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  )
}
