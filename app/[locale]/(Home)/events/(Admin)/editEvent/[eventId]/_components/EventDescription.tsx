'use client'
import React, { useState } from 'react'
import { Event } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'

import Editor from '@/app/[locale]/components/Editor'
import TextPreview from '@/app/[locale]/components/TextPreview'
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

interface EventDescriptionProps {
  event: Event
}

const EventDescriptionSchema = z.object({
  description: z
    .string()
    .min(100, { message: 'Description must be at least 100 characters long' }),
})

const EventDescription = ({ event }: EventDescriptionProps) => {
  const { toast } = useToast()

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
    console.log(values)
    try {
      await axios.put(`/api/events/edit/${event.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event description updated successfully',
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
            <span className="flex-center gap-x-2">
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
