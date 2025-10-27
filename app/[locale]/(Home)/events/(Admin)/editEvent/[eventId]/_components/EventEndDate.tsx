'use client'
import React, { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'

interface EventEndDateProps {
  event: Event
}

const EventEndDateSchema = z.object({
  endDate: z.date(),
})

const EventEndDate = ({ event }: EventEndDateProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()

  const form = useForm<z.infer<typeof EventEndDateSchema>>({
    resolver: zodResolver(EventEndDateSchema),
    defaultValues: {
      endDate: event.endDate || undefined,
    },
  })

  const { isValid, isSubmitting } = form.formState

  const onSubmit = async (data: z.infer<typeof EventEndDateSchema>) => {
    // Check if the end Date is after the start date
    const endDate = new Date(data.endDate).getTime()
    const startDate = event.startDate
      ? new Date(event.startDate).getTime()
      : null

    if (startDate !== null && endDate < startDate) {
      toast.error('End Date cannot be before the Start Date', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#ef4444', // red-500 color
        },
      })
      return
    }

    // Save the end date
    try {
      const response = await axiosInstance.put(
        `/api/events/edit/${event.id}`,
        data
      )
      console.log(response)
      toast.success('Event End Date updated successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    }
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event End Date</h3>
        <Button
          variant={null}
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            isEditing
              ? 'text-gray-700transition-all font-semibold duration-75 hover:text-red-700'
              : 'font-semibold text-red-700 transition-all duration-75 hover:text-gray-700'
          )}
        >
          {isEditing ? (
            'Cancel'
          ) : (
            <span className="flex gap-x-2">
              Edit <Pencil className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>

      {/* FORM */}
      <div>
        {isEditing ? (
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Use the calender above to pick your desired end date.
                </p>
                <Button
                  variant={'default'}
                  className="mt-6"
                  disabled={!isValid || isSubmitting}
                >
                  Save
                </Button>
              </form>
            </Form>
          </>
        ) : !event.endDate ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add an End Date for this event.
          </p>
        ) : (
          <p className="text-muted-foreground">
            {event.endDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default EventEndDate
