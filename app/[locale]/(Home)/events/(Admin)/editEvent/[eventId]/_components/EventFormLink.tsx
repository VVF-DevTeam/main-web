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

interface EventFormLinkProps {
  event: Event
}

const EventFormLinkSchema = z.object({
  formLink: z
    .string()
    .trim()
    .transform((val) => (val === '' ? '' : val))
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      { message: 'Invalid URL format' }
    ),
})

const EventTitle = ({ event }: EventFormLinkProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()

  const form = useForm<z.infer<typeof EventFormLinkSchema>>({
    resolver: zodResolver(EventFormLinkSchema),
    defaultValues: {
      formLink: event.formLink || '',
    },
  })

  const onSubmit = async (data: z.infer<typeof EventFormLinkSchema>) => {
    try {
      const response = await axiosInstance.put(
        `/api/events/edit/${event.id}`,
        { formLink: data.formLink || null }
      )
      toast.success(data.formLink ? 'Event form link updated successfully' : 'Event form link removed successfully', {
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
        <h3 className="text-lg font-bold">Event Registration Form Link</h3>
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
                  name="formLink"
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
        ) : !event.formLink ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add a link to registration form for this event.
          </p>
        ) : (
          <p className="text-muted-foreground">{event.formLink}</p>
        )}
      </div>
    </div>
  )
}

export default EventTitle
