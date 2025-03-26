'use client'
import React, { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'
import { Job } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'

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

interface JobEndDateProps {
  job: Job
}

// Allow endDate to be null
const JobEndDateSchema = z.object({
  endDate: z.date().nullable(),
})

const JobEndDate = ({ job }: JobEndDateProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [noEndDate, setNoEndDate] = useState(false) // NEW STATE
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof JobEndDateSchema>>({
    resolver: zodResolver(JobEndDateSchema),
    defaultValues: {
      endDate: job.endDate || null,
    },
  })

  const { isValid, isSubmitting } = form.formState

  const onSubmit = async (data: z.infer<typeof JobEndDateSchema>) => {
    // If 'noEndDate' is active, overwrite with null
													
    const endDate = noEndDate ? null : data.endDate

    const startDate = job.startDate
      ? new Date(job.startDate).getTime()
      : null

    if (startDate !== null && endDate && new Date(endDate).getTime() < startDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'End Date cannot be before the Start Date',
      })
      return
    }

						
    try {
      const response = await axios.put(`/api/jobs/edit/${job.id}`, {
        endDate,
      })
      console.log(response)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Job End Date updated successfully',
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
        <h3 className="text-lg font-bold">Job End Date</h3>
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
                  name="endDate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          value={field.value ?? undefined}
                          onChange={field.onChange}
                          disabled={noEndDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNoEndDate(!noEndDate)
                      if (!noEndDate) {
                        form.setValue('endDate', null)
                      }
                    }}
                  >
                    {noEndDate ? 'Have End Date' : 'No End Date'}
                  </Button>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  {noEndDate
                    ? 'End Date will be removed.'
                    : 'Use the calendar above to pick your desired end date.'}
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
        ) : !job.endDate ? (
          <p className="italic text-muted-foreground text-slate-500">
            No End Date set for this job.
          </p>
        ) : (
          <p className="text-muted-foreground">
            {new Date(job.endDate).toLocaleDateString('en-US')}
          </p>
        )}
      </div>
    </div>
  )
}

export default JobEndDate
