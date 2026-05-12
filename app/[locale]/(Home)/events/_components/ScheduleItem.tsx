'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import TimePicker from '../../../../../components/time/TimePicker'
import { toast } from 'sonner'
import { CheckIcon, XIcon, PlusIcon } from 'lucide-react'

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
import Loader from '@/components/loader/Loader'
import { cn } from '@/lib/utils'

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
}: ScheduleItemProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)
      const response = await axiosInstance.delete(
        `/api/events/schedule/scheduleItem/delete/${itemId}`
      )
      console.log(response)
      toast.success('Success', {
        description: 'Schedule item deleted successfully',
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
    } finally {
      setIsLoading(false)
    }
  }


  const addScheduleItem = async (scheduleItemId: string | null) => {
    const data = {
      scheduleItemId: scheduleItemId,
    }
    // Make API request to add new item to the db.
    try {
      setIsLoading(true)
      const response = await axiosInstance.post(
        `/api/events/schedule/scheduleItem/add`,
        data
      )
      console.log(response)
      toast.success('Success', {
        description: 'New schedule item added successfully',
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
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof scheduleItemSchema>) => {
    let response
    try {
      setIsLoading(true)
      if (scheduleItemId === null) {
        response = await axiosInstance.post(
          `/api/events/schedule/scheduleItem/add`,
          {
            ...data,
            eventId: eventId,
            scheduleItemId: null,
          }
        )
      } else {
        response = await axiosInstance.put(
          `/api/events/schedule/scheduleItem/edit/${scheduleItemId}`,
          data
        )
      }
      console.log(response)
      toast.success('Success', {
        description: 'Event schedule updated successfully',
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
    } finally {
      setIsLoading(false)
    }
  }

  const { isValid, errors } = form.formState

  return (
    <>
      {isLoading && <Loader />}
      <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'grid min-w-0 w-full grid-cols-1 gap-3',
          'sm:grid-rows-[auto_auto] sm:gap-x-2 sm:gap-y-2 xl:gap-x-4',
          isEditable
            ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'
            : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
        )}
      >
        <div className="flex min-w-0 w-full gap-x-2 sm:contents">
          <FormField
            name="startTime"
            control={form.control}
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1 sm:col-start-1 sm:row-start-1 sm:flex-none">
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
              <FormItem className="min-w-0 flex-1 sm:col-start-2 sm:row-start-1 sm:flex-none">
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
        </div>

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem className="min-w-0 w-full sm:col-span-2 sm:row-start-2 sm:min-w-0">
              <FormControl>
                <Input
                  placeholder="add..."
                  type="text"
                  required
                  disabled={!isEditable || isLoading}
                  className="h-[43px] min-w-0 w-full max-w-full overflow-x-auto"
                  {...field}
                />
              </FormControl>
              <FormMessage>{errors.description?.message}</FormMessage>
            </FormItem>
          )}
        />
        {isEditable && (
          <div className="flex w-full shrink-0 flex-col items-end gap-y-1 sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:h-full sm:w-auto sm:items-center sm:justify-center">
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
              disabled={ isLoading || scheduleItemId === null}
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
    </>
  )
}

export default ScheduleItem
