'use client'
import React, { useState, useEffect } from 'react'
import { Job } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, X } from 'lucide-react'

import Loader from '@/components/loader/Loader'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { axiosInstance } from '@/lib/axios'
import { getAllPublishedEvents } from '@/lib/actions/event/getEvent'
import { getPublishedEventsForReviewsWithSearch } from '@/lib/actions/review/reviewActions'

interface JobEventProps {
  job: Job & {
    event?: {
      id: string
      title: string
    } | null
  }
}

interface Event {
  id: string
  title: string
}

const JobEventSchema = z.object({
  eventId: z.string().nullable(),
})

const JobEvent = ({ job }: JobEventProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [eventSearchTerm, setEventSearchTerm] = useState('')

  const form = useForm<z.infer<typeof JobEventSchema>>({
    resolver: zodResolver(JobEventSchema),
    defaultValues: {
      eventId: job?.eventId || null,
    },
  })

  const { isSubmitting, isValid } = form.formState

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const publishedEvents = await getAllPublishedEvents()
        setEvents(publishedEvents)
        setFilteredEvents(publishedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    fetchEvents()
  }, [])

  const handleEventSearch = async (searchTerm: string) => {
    if (searchTerm === '') {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter((event) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEvents(filtered)
    }
  }

  const onSubmit = async (values: z.infer<typeof JobEventSchema>) => {
    try {
      setIsLoading(true)
      await axiosInstance.put(`/api/jobs/edit/${job.id}`, values)
      setEditing(false)
      toast.success('Success', {
        description: 'Job event link updated successfully',
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Error', {
        description: 'Something went wrong',
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearEvent = () => {
    form.setValue('eventId', null)
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Link to Event (Optional)</h1>
          <button
            onClick={() => setEditing(!editing)}
            className={cn(
              'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
              !editing && 'text-textColor-brand900 hover:text-slate-700'
            )}
            disabled={isLoading}
          >
            {editing ? (
              <span>Cancel</span>
            ) : (
              <span className="flex items-center justify-center gap-x-2">
                Edit Event <Pencil className="h-4 w-4" />
              </span>
            )}
          </button>
        </div>
        {editing ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 md:space-y-6"
            >
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="border">
                            <SelectValue placeholder="Select an event (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="pb-2">
                            <Input
                              type="search"
                              autoComplete="off"
                              placeholder="Input value and press Enter to search"
                              value={eventSearchTerm}
                              onChange={(e) => {
                                setEventSearchTerm(e.target.value)
                              }}
                              onKeyDown={async (e) => {
                                e.stopPropagation()
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  await handleEventSearch(eventSearchTerm)
                                }
                              }}
                              disabled={isLoading}
                            />
                          </div>
                          {filteredEvents.map((event: Event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleClearEvent}
                          className="h-10 w-10"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isSubmitting || !isValid || isLoading}>Save</Button>
            </form>
          </Form>
        ) : !job?.event ? (
          <p className="text-sm italic text-muted-foreground text-slate-500">
            No event linked. You can optionally link this job to an event.
          </p>
        ) : (
          <div className="text-muted-foreground">{job.event.title}</div>
        )}
      </div>
    </>
  )
}

export default JobEvent
