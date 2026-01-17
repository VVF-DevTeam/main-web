'use client'
import React, { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'
import Loader from '@/components/loader/Loader'

interface EventSubtitleProps {
  event: Event
}

const EventSubtitleSchema = z.object({
  subtitle: z.string().min(3, { message: 'Subtitle cannot be too short' }),
})

const EventSubtitle = ({ event }: EventSubtitleProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const currentDateTime = getCurrentDateTime()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof EventSubtitleSchema>>({
    resolver: zodResolver(EventSubtitleSchema),
    defaultValues: {
      subtitle: event?.subtitle || '',
    },
  })
  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof EventSubtitleSchema>) => {
    try {
      setIsLoading(true)
      await axiosInstance.put(`/api/events/edit/${event.id}`, values)
      setEditing(false)
      toast.success('Event subtitle updated successfully', {
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Subtitle (Optional)</h1>
        <button
          onClick={() => setEditing(!editing)}
          disabled={isLoading}
          className={cn(
            'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
            !editing && 'text-[#C54B3E] hover:text-slate-700'
          )}
        >
          {editing ? (
            <span>Cancel</span>
          ) : (
            <span className="flex items-center justify-center gap-x-2">
              Edit Subtitle <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {editing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-20 md:space-y-16"
          >
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input placeholder="Enter event subtitle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid || isLoading}>Save</Button>
          </form>
        </Form>
      ) : !event?.subtitle ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add a subtitle for this event.
        </p>
      ) : (
        <div className="text-muted-foreground">{event.subtitle}</div>
      )}
    </div>
    </>
  )
}

export default EventSubtitle 