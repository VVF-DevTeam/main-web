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
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

interface JobLocationProps {
  job: Job
}

const JobLocationSchema = z.object({
  location: z.string().min(10, {message: "Location is required"}),
})

const JobLocation = ({ job }: JobLocationProps) => {
  const { toast } = useToast()

  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof JobLocationSchema>>({
    resolver: zodResolver(JobLocationSchema),
    defaultValues: {
      location: job?.location || "",
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof JobLocationSchema>) => {
    console.log(values)
    try {
      await axios.put(`/api/jobs/edit/${job.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Job location updated successfully',
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
        <h1 className="text-xl font-semibold">Job Location</h1>
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
              Edit Location <Pencil className="h-4 w-4" />
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
              name="location"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input placeholder="eg: Metro Vancouver" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !job?.location ? (
        <p className="text-sm italic text-muted-foreground text-slate-500">
          Add a location for this job.
        </p>
      ) : (
        <div className="text-muted-foreground">{job.location}</div>
      )}
    </div>
  )
}

export default JobLocation
