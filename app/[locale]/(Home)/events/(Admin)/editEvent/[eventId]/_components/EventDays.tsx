'use client'
import React, { useState } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField } from '@/components/ui/form'

interface EventEndDays {
  event: Event
}

const EventDaysSchema = z
  .object({
    days: z
      .string()
      .array()
      .min(1, { message: 'Please select at least one day' })
      .max(7, { message: 'Please select at most 7 days' }),
  })
  .refine((data) => data.days.length > 0, {
    message: 'Please select at least one day',
  })

const EventDays = ({ event }: EventEndDays) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof EventDaysSchema>>({
    resolver: zodResolver(EventDaysSchema),
    defaultValues: {
      days: event.days || [],
    },
  })
  const eventDays = [...event.days]
  const { isValid, isSubmitting } = form.formState

  const sorter: Record<string, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  }

  eventDays.sort(function sortByDay(a, b) {
    const day1 = a.toLowerCase()
    const day2 = b.toLowerCase()
    return sorter[day1] - sorter[day2]
  })
  const onSubmit = async (data: z.infer<typeof EventDaysSchema>) => {
    try {
      const response = await axios.put(`/api/events/edit/${event.id}`, data)
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event Days updated successfully',
      })
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
        <h3 className="text-lg font-bold">Event Days</h3>
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
                  name="days"
                  control={form.control}
                  render={({ field }) => (
                    <FormControl>
                      <ToggleGroup
                        type="multiple"
                        variant={'outline'}
                        className="flex-wrap-dafault gap-y-2"
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <ToggleGroupItem
                          className="rounded-full bg-slate-400 px-3 py-1 text-sm text-white"
                          value="MONDAY"
                          aria-label="Toggle Monday"
                        >
                          Monday
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="rounded-full bg-slate-400 px-3 py-1 text-sm text-white"
                          value="TUESDAY"
                          aria-label="Toggle Tuesday"
                        >
                          Tuesday
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="rounded-full bg-slate-400 px-3 py-1 text-sm text-white"
                          value="WEDNESDAY"
                          aria-label="Toggle Wednesday"
                        >
                          Wednesday
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="rounded-full bg-slate-400 px-3 py-1 text-sm text-white"
                          value="THURSDAY"
                          aria-label="Toggle Thursday"
                        >
                          Thursday
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="rounded-full bg-slate-400 px-3 py-1 text-sm text-white"
                          value="FRIDAY"
                          aria-label="Toggle Friday"
                        >
                          Friday
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="rounded-full bg-slate-400 px-3 py-1 text-sm text-white"
                          value="SATURDAY"
                          aria-label="Toggle Saturday"
                        >
                          Saturday
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          className="rounded-full bg-slate-400 px-3 py-1 text-sm text-white"
                          value="SUNDAY"
                          aria-label="Toggle Sunday"
                        >
                          Sunday
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                  )}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Pick your desired days.
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
        ) : event.days.length === 0 ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add days for this event.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-muted-foreground">
            {eventDays.map((day, index) => (
              <div
                className="flex items-center justify-center rounded-2xl border-2 border-slate-400 bg-slate-200 p-1 font-semibold"
                key={index}
              >
                {day.substring(0, 3)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDays
