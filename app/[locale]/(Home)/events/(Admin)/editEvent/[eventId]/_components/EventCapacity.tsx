'use client'
import React, { useState } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'

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
  FormMessage,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'

interface EventCapacityProps {
  event: Event
}

const EventCapacitySchema = z.object({
  capacity: z.coerce
    .number()
    .min(1, { message: 'Capacity must be at least 1' }),
})

const EventCapacity = ({ event }: EventCapacityProps) => {
  const { toast } = useToast()

  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof EventCapacitySchema>>({
    resolver: zodResolver(EventCapacitySchema),
    defaultValues: {
      capacity: event?.capacity || 0,
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof EventCapacitySchema>) => {
    try {
      await axiosInstance.put(`/api/events/edit/${event.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event capacity updated successfully',
      })
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
    <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Capacity</h1>
        <button
          onClick={() => setEditing(!editing)}
          className={cn(
            'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
            !editing && 'text-[#C54B3E] hover:text-slate-700'
          )}
        >
          {editing ? (
            <span>Cancel</span>
          ) : (
            <span className="flex items-center justify-center gap-x-2">
              Edit Price <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {editing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-20 md:space-y-8"
          >
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input type="number" placeholder="eg: 50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !event?.capacity ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add capacity for this event.
        </p>
      ) : (
        <div className="text-muted-foreground">{event.capacity}</div>
      )}
    </div>
  )
}

export default EventCapacity
