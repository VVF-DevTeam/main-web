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

interface EventFullDiscountProps {
  event: Event
}

const EventFullDiscountSchema = z.object({
  fullCourseDiscount: z.coerce
    .number()
    .min(0, { message: 'Discount must be at least 0' })
    .max(100, { message: 'Discount cannot exceed 100' })
    .int({ message: 'Discount must be a whole number' }),
})

const EventFullDiscount = ({ event }: EventFullDiscountProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const currentDateTime = getCurrentDateTime()

  const form = useForm<z.infer<typeof EventFullDiscountSchema>>({
    resolver: zodResolver(EventFullDiscountSchema),
    defaultValues: {
      fullCourseDiscount: event?.fullCourseDiscount || 0,
    },
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof EventFullDiscountSchema>) => {
    try {
      await axiosInstance.put(`/api/events/edit/${event.id}`, values)
      setEditing(false)
      toast.success('Full discount updated successfully', {
        description: (
          <span style={{ color: "var(--muted-foreground)" }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e' // green-500 color
        }
      })
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
    <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Full Course Discount</h1>
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
              Edit Discount <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {editing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-20 md:space-y-8"
          >
            <FormField
              control={form.control}
              name="fullCourseDiscount"
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
      ) : !event?.fullCourseDiscount ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add full course discount (class only) for this event. The valid value is between 0 and 100 (0% means no discount). Please note if leave it blank, the discount will be 0%.
        </p>
      ) : (
        <div className="text-muted-foreground">{event.fullCourseDiscount}%</div>
      )}
    </div>
  )
}

export default EventFullDiscount
