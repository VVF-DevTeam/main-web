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
import axios, { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

interface EventTitleProps {
  event: Event
}

const EventTitleSchema = z.object({
  title: z
    .string()
    .min(6, { message: 'Event title must be at least 6 characters' }),
})

const EventTitle = ({ event }: EventTitleProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof EventTitleSchema>>({
    resolver: zodResolver(EventTitleSchema),
    defaultValues: {
      title: event.title || '',
    },
  })

  const onSubmit = async (data: z.infer<typeof EventTitleSchema>) => {
    try {
      const response = await axios.put(`/api/events/edit/${event.id}`, data)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event title updated successfully',
      })
      console.log(response)
      setIsEditing(false)
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast({
            variant: 'destructive',
            title: 'Duplicate Event Title',
            description: 'There is already an event with this title',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Error making request to database',
            description:
              error.response?.data ||
              'Something went wrong. Please contact the admin',
          })
        }
      } else if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error?.message || 'Something went wrong. Please contact the admin.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please contact the admin.',
        })
      }
    }
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Event Title</h3>
        <Button
          variant={null}
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            isEditing
              ? 'font-semibold text-gray-700 transition-all duration-75 hover:text-red-700'
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
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white p-2 text-gray-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button variant={'default'} className="mt-6">
                  Save
                </Button>
              </form>
            </Form>
          </>
        ) : !event.title ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add a title for this event.
          </p>
        ) : (
          <p className="text-muted-foreground">{event.title}</p>
        )}
      </div>
    </div>
  )
}

export default EventTitle
