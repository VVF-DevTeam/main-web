'use client'
import React, { useState } from 'react'
import { Job } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'

interface JobTypeProps {
  job: Job
}

const zEnum = z.enum(['HR', 'Job', 'Tech', 'Media', 'Operations', 'Event'])

const JobTypeSchema = z.object({
  jobType: zEnum,
})

const JobType = ({ job }: JobTypeProps) => {
  const { toast } = useToast()

  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof JobTypeSchema>>({
    resolver: zodResolver(JobTypeSchema),
    defaultValues: {
      jobType: job?.jobType || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof JobTypeSchema>) => {
    console.log(values)
    try {
      await axiosInstance.put(`/api/jobs/edit/${job.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Job type updated successfully',
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
        <h1 className="text-xl font-semibold">Job Type</h1>
        <button
          onClick={() => setEditing(!editing)}
          className={cn(
            'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
            !editing && 'text-textColor-brand hover:text-slate-700'
          )}
        >
          {editing ? (
            <span>Cancel</span>
          ) : (
            <span className="flex items-center justify-center gap-x-2">
              Edit Type <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {editing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 md:space-y-12"
          >
            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem className="flex items-center justify-center">
                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {field.value.length > 1 ? field.value : 'Select'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40">
                        <DropdownMenuLabel>Select Job Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          {...field}
                        >
                          <DropdownMenuRadioItem value="Media">
                            Media
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Operations">
                            Operations
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Event">
                            Event
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="HR">
                            HR
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Tech">
                            Tech
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !job?.jobType ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add an jobType for this job.
        </p>
      ) : (
        <div className="text-muted-foreground">{job.jobType}</div>
      )}
    </div>
  )
}

export default JobType
