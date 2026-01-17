'use client'
import React, { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import moment from 'moment-timezone'
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
import Loader from '@/components/loader/Loader'

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
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof EventEndDateSchema>>({
    resolver: zodResolver(EventEndDateSchema),
    defaultValues: {
      endDate: event.endDate || undefined,
    },
  })

  const { isValid, isSubmitting } = form.formState

  const onSubmit = async (data: z.infer<typeof EventEndDateSchema>) => {
    try {
      setIsLoading(true)
      // Treat the selected date as midnight in Vancouver timezone (replace timezone, don't convert)
      const vancouverTimeZone = 'America/Vancouver'
      const selectedDate = data.endDate
      
      // Extract year, month, day from the selected date
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0') // moment expects 1-12
      const day = String(selectedDate.getDate()).padStart(2, '0')
      
      // Create a moment at midnight in Vancouver timezone using the selected date components
      // Format: YYYY-MM-DD HH:mm:ss
      const dateString = `${year}-${month}-${day} 12:00:00`
      const vancouverMidnight = moment.tz(dateString, 'YYYY-MM-DD HH:mm:ss', vancouverTimeZone)
      
      // Convert from Vancouver timezone to UTC
      const vancouverMidnightUTC = vancouverMidnight.utc().toDate()
      
      // Check if the end Date is after the start date
      const endDate = vancouverMidnightUTC.getTime()
      const startDate = event.startDate
        ? new Date(event.startDate).getTime()
        : null

      // If the end Date is before the start Date, show an error
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

      // Format the data with the converted date
      const formattedData = {
        ...data,
        endDate: vancouverMidnightUTC,
      }

      // Save the end date
      const response = await axiosInstance.put(
        `/api/events/edit/${event.id}`,
        formattedData
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event End Date</h3>
        <Button
          variant={null}
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
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
                  disabled={!isValid || isSubmitting || isLoading}
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
            {new Date(event.endDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
    </>
  )
}

export default EventEndDate
