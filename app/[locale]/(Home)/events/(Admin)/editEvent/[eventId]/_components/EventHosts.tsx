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
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

interface EventHostsProps {
  event: Event
}

const EventHostsSchema = z.object({
  hosts: z
    .string()
    .array()
    .min(1, { message: 'Please select at least one host' }),
})

const EventHosts = ({ event }: EventHostsProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof EventHostsSchema>>({
    resolver: zodResolver(EventHostsSchema),
    defaultValues: {
      hosts: event.days || [],
    },
  })

  const { isValid, isSubmitting } = form.formState

  const onSubmit = async (data: z.infer<typeof EventHostsSchema>) => {
    console.log(data)
    try {
      const response = await axios.put(`/api/events/edit/${event.id}`, data)
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event Hosts updated successfully',
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
        <h3 className="text-lg font-bold">Event Hosts</h3>
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
                  name={'hosts'}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
            Add the hosts for this event.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-muted-foreground">
            {/* {eventDays.map((day, index) => (
              <div
                className="flex items-center justify-center rounded-2xl border-2 border-slate-400 bg-slate-200 p-1 font-semibold"
                key={index}
              >
                {day.substring(0, 3)}
              </div>
            ))} */}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventHosts
