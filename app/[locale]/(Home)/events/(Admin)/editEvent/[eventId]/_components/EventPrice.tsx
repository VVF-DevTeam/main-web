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

interface EventPriceProps {
  event: Event
}

interface StripeDataCreate {
  success: boolean
  productId: string
  priceId: string
}

interface StripeDataEdit {
  success: boolean
  newPriceId: string
}

const EventPriceSchema = z.object({
  price: z.coerce.number(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
})

const EventPrice = ({ event }: EventPriceProps) => {
  const { toast } = useToast()

  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof EventPriceSchema>>({
    resolver: zodResolver(EventPriceSchema),
    defaultValues: {
      price: event?.price ? Number(event.price) : 0,
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof EventPriceSchema>) => {
    try {
      // create or update price product in stripe
      if (!event.stripeProductId) {
        const { data } = await axiosInstance.post<StripeDataCreate>(
          '/api/payment/events',
          {
            eventId: event.id,
            eventUrl: `https://www.vietvibe.org/en/events/class/${event.keyName}`,
            price: values.price,
            title: event.title,
          }
        )
        values.stripeProductId = data.productId
        values.stripePriceId = data.priceId
      } else {
        const { data } = await axiosInstance.put<StripeDataEdit>(
          '/api/payment/events',
          {
            eventUrl: `https://www.vietvibe.org/en/events/class/${event.keyName}`,
            eventId: event.id,
            price: values.price,
            stripeProductId: event.stripeProductId,
            stripePriceId: event.stripePriceId,
          }
        )

        values.stripePriceId = data.newPriceId
      }

      await axiosInstance.put(`/api/events/edit/${event.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event price updated successfully',
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
        <h1 className="text-xl font-semibold">Event Price</h1>
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
              Edit Price <Pencil className="h-4 w-4" />
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
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input type="number" placeholder="eg: 20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !event?.price ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add a price for this event.
        </p>
      ) : (
        <div className="text-muted-foreground">
          ${Number(event.price).toFixed(2)}
        </div>
      )}
    </div>
  )
}

export default EventPrice
