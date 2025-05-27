'use client'
import React, { useState } from 'react'
import { Job } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'

interface JobTitleProps {
  job: Job,
}

const JobTitleSchema = z.object({
  title: z
    .string()
    .min(6, { message: 'Job title must be at least 6 characters' }),
})

const JobTitle = ({ job }: JobTitleProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof JobTitleSchema>>({
    resolver: zodResolver(JobTitleSchema),
    defaultValues: {
      title: job.title || '',
    },
  })

  const onSubmit = async (data: z.infer<typeof JobTitleSchema>) => {
    try {
      const response = await axios.put(`/api/jobs/edit/${job.id}`, data)
      toast.success('Success', {
        description: 'Job title updated successfully',
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      console.log(response)
      setIsEditing(false)
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error('Error', {
            description: 'There is already an Job with this title',
            style: {
              color: '#ef4444' // red-500 color
            }
          })
        } else {
          toast.error('Error', {
            description: error.response?.data || 'Something went wrong',
            style: {
              color: '#ef4444' // red-500 color
            }
          })
        }
      } else if (error instanceof Error) {
        toast.error('Error', {
          description: error?.message || 'Something went wrong',
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      } else {
        toast.error('Error', {
          description: 'Something went wrong',
          style: {
            color: '#ef4444' // red-500 color
          }
        })
      }
    }
  }

  return (
    <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Job Title</h3>
        <Button
          variant={null}
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            isEditing
              ? 'font-semibold text-gray-700 transition-all duration-75 hover:text-red-700'
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
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white p-2 text-gray-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button variant={'default'} className="mt-6">
                  Save
                </Button>
              </form>
            </Form>
          </>
        ) : !job.title ? (
          <p className="italic text-muted-foreground text-slate-500">
            Add a title for this job.
          </p>
        ) : (
          <p className="text-muted-foreground">{job.title}</p>
        )}
      </div>
    </div>
  )
}

export default JobTitle
