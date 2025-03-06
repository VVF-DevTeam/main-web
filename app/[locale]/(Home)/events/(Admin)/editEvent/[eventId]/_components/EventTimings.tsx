'use client'
import React, { useState } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'
import TimePicker from '@/app/[locale]/components/TimePicker'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

interface EventTimingsProps {
  event: Event
}

const EventTimingsSchema = z.object({
  startTime: z.string().min(1, { message: 'Event must have a start time' }),
  endTime: z.string().min(1, { message: 'Event must have a start time' }),
})

const EventTimings = ({ event }: EventTimingsProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof EventTimingsSchema>>({
    resolver: zodResolver(EventTimingsSchema),
    defaultValues: {
      startTime: event.startTime || undefined,
      endTime: event.endTime || undefined,
    },
  })

  const onSubmit = async (data: z.infer<typeof EventTimingsSchema>) => {
    try {
      const response = await axios.put(`/api/events/edit/${event.id}`, data)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event Timings updated successfully',
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
        <h3 className="text-lg font-bold">Event Timings</h3>
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
                <div className="flex flex-col items-center justify-evenly gap-y-6 xl:flex-row">
                  <FormField
                    name="startTime"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimePicker
                            label="Start Time"
                            value={field.value || '00:00'}
                            onChange={field.onChange}
                            isEditable={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="endTime"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TimePicker
                            label="End Time"
                            value={field.value || '00:00'}
                            onChange={field.onChange}
                            isEditable={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button variant={'default'} className="mt-6">
                  Save
                </Button>
              </form>
            </Form>
          </>
        ) : !event.startTime || !event.endTime ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add event timings.
          </p>
        ) : (
          <p className="text-muted-foreground">
            {event.startTime} -- {event.endTime}
          </p>
        )}
      </div>
    </div>
  )
}

export default EventTimings
