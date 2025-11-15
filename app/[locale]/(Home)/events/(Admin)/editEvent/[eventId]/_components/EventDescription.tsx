'use client'
import React, { useState } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

import Editor from '@/app/[locale]/components/Editor'
import TextPreview from '@/app/[locale]/components/TextPreview'
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
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

interface EventDescriptionProps {
  event: Event
}

const EventDescriptionSchema = z.object({
  description: z
    .string()
    .min(100, { message: 'Description must be at least 100 characters long' }),
})

// function htmlToVisibleText(html: string): string {
//   if (typeof window !== 'undefined') {
//     const div = document.createElement('div')
//     div.innerHTML = html
//     return div.innerText.trim()
//   }

//   // For server environments (Node.js), you can fall back to a lightweight HTML-to-text library
//   return html
//     .replace(/<br\s*\/?>/gi, '\n')
//     .replace(/<\/p>/gi, '\n')
//     .replace(/<[^>]+>/g, '')
//     .replace(/\n{2,}/g, '\n')
//     .trim()
// }

const EventDescription = ({ event }: EventDescriptionProps) => {
  const currentDateTime = getCurrentDateTime()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof EventDescriptionSchema>>({
    resolver: zodResolver(EventDescriptionSchema),
    defaultValues: {
      description: event?.description || '',
    },
  })
  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof EventDescriptionSchema>) => {
    try {
      // update the event description
      await axiosInstance.put(`/api/events/edit/${event.id}`, values)

      // update product description
      // const processedText = htmlToVisibleText(values.description)

      // if (event.stripeProductId) {
      //   await axiosInstance.put(`/api/payment/events`, {
      //     stripeProductId: event.stripeProductId,
      //     description: processedText,
      //   })
      // }

      // send a success message
      setEditing(false)
      toast.success('Event description updated successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
            </span>
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          </div>
        ),
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    }
  }

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Description</h1>
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
              Edit Description <Pencil className="h-4 w-4" />
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
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Editor onChange={field.onChange} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !event?.description ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add a description for this event.
        </p>
      ) : (
        <div className="text-muted-foreground">
          <TextPreview value={event.description} />
        </div>
      )}
    </div>
  )
}

export default EventDescription
