'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

import TimePicker from './TimePicker'
import { useToast } from '@/hooks/use-toast'
import { CheckIcon, XIcon, PlusIcon } from 'lucide-react'

import axios from 'axios'
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

interface ScheduleItemProps {
  eventId: string
  scheduleItemId: string | null
  description: string
  startTime: string
  endTime: string
  position: number | null
  isEditable?: boolean
}

const scheduleItemSchema = z.object({
  description: z
    .string()
    .min(4, { message: 'Description must be at least 4 characters long' }),
  startTime: z.string().min(1, { message: 'Event must have a start time' }),
  endTime: z.string().min(1, { message: 'Event must have an end time' }),
})

const ScheduleItem = ({
  startTime,
  endTime,
  description,
  isEditable = true,
  eventId,
  scheduleItemId,
  position,
}: ScheduleItemProps) => {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof scheduleItemSchema>>({
    resolver: zodResolver(scheduleItemSchema),
    defaultValues: {
      description: description || '',
      startTime: startTime,
      endTime: endTime,
    },
  })

  const deleteScheduleItem = async (itemId: string | null) => {
    if (!itemId) return
    try {
      const response = await axios.delete(
        `/api/events/schedule/scheduleItem/delete/${itemId}`
      )
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'deleted item from schedule',
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

  const addScheduleItem = async (scheduleItemId: string | null) => {
    const data = {
      scheduleItemId: scheduleItemId,
    }
    // Make API request to add new item to the db.
    try {
      const response = await axios.post(
        `/api/events/schedule/scheduleItem/add`,
        data
      )
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'added new item to schedule',
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
  const onSubmit = async (data: z.infer<typeof scheduleItemSchema>) => {
    let response
    try {
      if (scheduleItemId === null) {
        response = await axios.post(`/api/events/schedule/scheduleItem/add`, {
          ...data,
          eventId: eventId,
          scheduleItemId: null,
        })
      } else {
        response = await axios.put(
          `/api/events/schedule/scheduleItem/edit/${scheduleItemId}`,
          data
        )
      }
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Event Shedule updated successfully',
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

  const { isValid, isLoading, errors } = form.formState

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center gap-x-2 xl:gap-x-4"
      >
        <>
          <FormField
            name="startTime"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TimePicker
                    isEditable={!isEditable}
                    value={field.value || startTime}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage>{errors.startTime?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            name="endTime"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TimePicker
                    isEditable={!isEditable}
                    value={field.value || endTime}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage>{errors.endTime?.message}</FormMessage>
              </FormItem>
            )}
          />
        </>

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="add..."
                  type="text"
                  required
                  disabled={!isEditable}
                  className="h-[43px] w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage>{errors.description?.message}</FormMessage>
            </FormItem>
          )}
        />
        {isEditable && (
          <div className="flex gap-x-1">
            {/* Save button */}
            <Button
              variant={'outline'}
              size={'sm'}
              disabled={!isValid || isLoading}
              type="submit"
            >
              <CheckIcon className="h-4 w-4 text-green-400" />
            </Button>

            {/* Delete button */}
            <Button
              variant={'destructive'}
              size={'sm'}
              disabled={!isValid || isLoading || scheduleItemId === null}
              type="button"
              onClick={() => deleteScheduleItem(scheduleItemId)}
            >
              <XIcon className="h-4 w-4 text-slate-50" />
            </Button>

            {/* Add button */}
            <Button
              variant={'outline'}
              size={'sm'}
              disabled={scheduleItemId === null || isLoading}
              type="button"
              onClick={() => addScheduleItem(scheduleItemId)}
            >
              <PlusIcon className="h-4 w-4 text-blue-400" />
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

export default ScheduleItem
