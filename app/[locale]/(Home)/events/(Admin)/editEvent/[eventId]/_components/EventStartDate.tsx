'use client'
import React, { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import 'react-day-picker/style.css'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'

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
  const { toast } = useToast()

  const form = useForm<z.infer<typeof EventStartDateSchema>>({
    resolver: zodResolver(EventStartDateSchema),
    defaultValues: {
      startDate: event.startDate || undefined,
    },
  })

  const onSubmit = async (data: z.infer<typeof EventStartDateSchema>) => {
    try {
      const response = await axiosInstance.put(
        `/api/events/edit/${event.id}`,
        data
      )
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event Start Date updated successfully',
      })
      console.log(response)
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
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
            {event.startDate.toLocaleDateString('en-US')}
          </p>
        )}
      </div>
    </div>
  )
}

export default EventStartDate
