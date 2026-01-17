'use client'
// Libraries
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { axiosInstance } from '@/lib/axios'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Loader from '@/components/loader/Loader'

// Components
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Input } from '@/components/ui/input'
import { Separator } from '@radix-ui/react-separator'
import formatKeyName from '@/lib/utilFunctions/keyNameUtils'

// Interfaces
interface CreateJobFormProps {
  author: string
  redirectToProfile?: {
    locale: string
    userId: string
  }
}
// TODO: Abstract the createEventSchema to a separate file
const createJobSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, { message: 'Title must be at least 2 characters long' })
    .max(40, { message: 'Title must be at most 20 characters long' }),
  jobType: z.string().min(1, { message: 'Event type is required' }),
})

// Main Component
const CreateJobForm = ({ author, redirectToProfile }: CreateJobFormProps) => {
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      jobType: '',
    },
  })
  const { isValid } = form.formState

  const onSubmit = async (data: z.infer<typeof createJobSchema>) => {
    //Format title to trims whitespaces
    const title = data.title.trim()

    // Format title to keyName, which is used for pathname
    const keyName = formatKeyName(title)

    try {
      setIsLoading(true)
      const jobData = {
        title: title,
        jobType: data.jobType,
        keyName: keyName,
        userId: author,
      }
      const response = await axiosInstance.post('/api/jobs/create', jobData)
      if (response.status === 200) {
        toast.success('Job created successfully', {
          description: (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {currentDateTime}
            </span>
          ),
          style: {
            color: '#22c55e', // green-500 color
          },
        })
      }

      form.reset()
      router.refresh()
      if (redirectToProfile) {
        router.push(
          `/${redirectToProfile.locale}/profile/${redirectToProfile.userId}?section=admin-edit-job&jobId=${response.data.keyName}`
        )
      } else {
        router.push(`/registration/jobs/editJob/${response.data.keyName}`)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error('Duplicate Job Title', {
            description: (
              <div className="flex flex-col gap-1">
                <span>
                  There is already a job with this title, please reuse it or
                  delete it
                </span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        } else {
          toast.error('Error making request to database', {
            description: (
              <div className="flex flex-col gap-1">
                <span>
                  {error.response?.data ||
                    'Something went wrong. Please contact the admin'}
                </span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        }
      } else if (error instanceof Error) {
        toast.error(
          error.message || 'Something went wrong. Please contact the admin.',
          {
            description: (
              <div className="flex flex-col gap-1">
                <span>Something went wrong. Please contact the admin.</span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          }
        )
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col items-center gap-y-8">
        <div className="flex flex-col items-center gap-y-2">
          <h1 className="mb-2 text-2xl font-semibold text-[#1B171A]/80 lg:text-2xl xl:text-3xl">
            Give a title to your job posting
          </h1>
        <p className="text-sm text-muted-foreground">
          What would you like to name your job posting? Do not worry, you can
          change this later.
        </p>
      </div>
      <Separator className="h-[2.5px] w-[70%] bg-slate-400/20" />
      <Form {...form}>
        <form
          className="mt-10 flex flex-col gap-y-8"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand900">
                  Job Title
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: My job title"
                    className="w-80 text-textColor xl:max-w-[400px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>What is your job about?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mr-2 text-textColor-brand900">
                  Job Department:
                </FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        {field.value.length > 1 ? field.value : 'Select'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuLabel>Select Department</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        {...field}
                      >
                        <DropdownMenuRadioItem value="Marketing">
                          Marketing
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Finance">
                          Finance
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="ProjectManager">
                          ProjectManager
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="HR">
                          HR
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Tech">
                          Tech
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Volunteer">
                          Volunteer
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
          <div className="flex gap-x-6">
            <Button
              variant={'outline'}
              size={'lg'}
              disabled={!isValid || isLoading}
              className="text-md max-w-fit bg-bgColor-brand900 font-bold text-textColor-white hover:bg-bgColor-brand600 hover:text-textColor-white"
              type="submit"
            >
              Create Job
            </Button>
            <Link href={'/registration/jobs'}>
              <Button
                variant={'ghost'}
                size={'lg'}
                disabled={isLoading}
                className="text-md max-w-fit font-bold"
                type="button"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Form>
      </div>
    </>
  )
}

export default CreateJobForm
