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
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import Image from 'next/image'
import { axiosInstance } from '@/lib/axios'

interface EventImageProps {
  event: Event
}

const EventImageSchema = z.object({
  imgUrl: z.string().min(1, { message: 'Event Image is required' }),
  subImgUrls: z.array(z.string()).max(2).optional(),
})

const EventImage = ({ event }: EventImageProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof EventImageSchema>>({
    resolver: zodResolver(EventImageSchema),
    defaultValues: {
      imgUrl: event?.imgUrl || '',
      subImgUrls: (event?.subImgUrls as string[]) || [],
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof EventImageSchema>) => {
    try {
      await axiosInstance.put(`/api/events/edit/${event.id}`, values)
      setEditing(false)
      toast.success('Success', {
        description: 'Event image updated successfully',
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
    }
  }

  return (
    <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Event Image</h1>
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
              Edit Image <Pencil className="h-4 w-4" />
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
              name="imgUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input placeholder="Enter Cover Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {event.eventType === 'CONCERT' && (
              <>
                <FormField
                  control={form.control}
                  name="subImgUrls.0"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input placeholder="Enter First Sub Image URL. This will be the big image on the right of top of the page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subImgUrls.1"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input placeholder="Enter Second Sub Image URL. This will be the small image on the middle of top of the page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !event?.imgUrl ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add an image for this event.
        </p>
      ) : (
        <div className="flex flex-col gap-y-4">
          <div className="relative mx-auto aspect-video h-[250px] w-[560px]">
            <Image
              fill
              src={event?.imgUrl}
              alt="Event Cover Image"
              className="rounded-md object-cover"
            />
          </div>
          {event.eventType === 'CONCERT' && (event?.subImgUrls as string[])?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {(event?.subImgUrls as string[]).map((subImage, index) => (
                <div key={index} className="relative aspect-video h-[200px] w-[400px]">
                  <Image
                    fill
                    src={subImage}
                    alt={`Event Sub Image ${index + 1}`}
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EventImage
