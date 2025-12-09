'use client'
import React, { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import 'react-day-picker/style.css'
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

interface EventStartDateProps {
  event: Event
}

const EventStartDateSchema = z.object({
  startDate: z.date(),
})

const EventStartDate = ({ event }: EventStartDateProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()

  const form = useForm<z.infer<typeof EventStartDateSchema>>({
    resolver: zodResolver(EventStartDateSchema),
    defaultValues: {
      startDate: event.startDate || undefined,
    },
  })

  const onSubmit = async (data: z.infer<typeof EventStartDateSchema>) => {
    try {
      // Treat the selected date as midnight in Vancouver timezone (replace timezone, don't convert)
      const vancouverTimeZone = 'America/Vancouver'
      const selectedDate = data.startDate
      
      // Extract year, month, day from the selected date
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0') // moment expects 1-12
      const day = String(selectedDate.getDate()).padStart(2, '0')
      
      // Create a moment at midnight in Vancouver timezone using the selected date components
      // Format: YYYY-MM-DD HH:mm:ss
      const dateString = `${year}-${month}-${day} 00:00:00`
      const vancouverMidnight = moment.tz(dateString, 'YYYY-MM-DD HH:mm:ss', vancouverTimeZone)
      // Convert from Vancouver timezone to UTC
      const vancouverMidnightUTC = vancouverMidnight.utc().toDate()
      // Format the data with the converted date
      const formattedData = {
        ...data,
        startDate: vancouverMidnightUTC,
      }
      
      const response = await axiosInstance.put(
        `/api/events/edit/${event.id}`,
        formattedData
      )
      toast.success('Event Start Date updated successfully', {
        description: (
          <span style={{ color: "var(--muted-foreground)" }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      console.log(response)
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', { 
        description: (
          <div className="flex flex-col gap-1">
            <span>{error instanceof Error ? error.message : 'Please try again later'}</span>
            <span style={{ color: "var(--muted-foreground)" }}>{currentDateTime}</span>
          </div>
        ),
        style: {
          color: '#ef4444' // red-500 color
        }
      })
    }
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event Start Date</h3>
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
                  name="startDate"
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
                  Use the calender above to pick your desired start date.
                </p>
                <Button variant={'default'} className="mt-6">
                  Save
                </Button>
              </form>
            </Form>
          </>
        ) : !event.startDate ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add a Start Date for this event.
          </p>
        ) : (
          <p className="text-muted-foreground">
            {new Date(event.startDate).toLocaleDateString('en-US', {
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

export default EventStartDate
