'use client'
import React, { useState } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'
import Loader from '@/components/loader/Loader'

// Interfaces and Types
interface EventTypeProps {
  event: Event
}

const zEnum = z.enum(['CONCERT', 'CLASS', 'CAMPING', 'EVENT'])

const EventTypeSchema = z.object({
  eventType: zEnum,
})

// Main Component
const EventType = ({ event }: EventTypeProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof EventTypeSchema>>({
    resolver: zodResolver(EventTypeSchema),
    defaultValues: {
      eventType: event?.eventType || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof EventTypeSchema>) => {

    try {
      setIsLoading(true)
      await axiosInstance.put(`/api/events/edit/${event.id}`, values)
      setEditing(false)
      toast.success('Success', {
        description: 'Event type updated successfully',
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Error', {
        description: 'Something went wrong',
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
        <h1 className="text-xl font-semibold">Event Type</h1>
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
              Edit Type <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {editing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 md:space-y-12"
          >
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem className="flex items-center justify-center">
                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {field.value.length > 1 ? field.value : 'Select'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40">
                        <DropdownMenuLabel>Select Event Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          {...field}
                        >
                          <DropdownMenuRadioItem value="CLASS">
                            Class
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="CONCERT">
                            Concert
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="CAMPING">
                            Camping
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="EVENT">
                            Event
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid || isLoading}>Save</Button>
          </form>
        </Form>
      ) : !event?.eventType ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add an eventType for this event.
        </p>
      ) : (
        <div className="text-muted-foreground">{event.eventType}</div>
      )}
    </div>
    </>
  )
}

export default EventType
