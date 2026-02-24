'use client'
// Libraries
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

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
import { axiosInstance } from '@/lib/axios'
import formatKeyName from '@/lib/utilFunctions/keyNameUtils'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Loader from '@/components/loader/Loader'

// Interfaces
interface CreateEventFormProps {
  author: string
  redirectToProfile?: {
    locale: string
  }
}
// TODO: Abstract the createEventSchema to a separate file
const createEventSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, { message: 'Title must be at least 2 characters long' })
    .max(35, { message: 'Title must be at most 35 characters long' }),
  eventType: z.string().min(1, { message: 'Event type is required' }),
})

// Main Component
const CreateEventForm = ({
  author,
  redirectToProfile,
}: CreateEventFormProps) => {
  // TODO: Add author field for event
  console.log(author)
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      eventType: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof createEventSchema>) => {
    //Format title to trims whitespaces
    const title = data.title.trim()

    // Format title to keyName, which is used for pathname
    const keyName = formatKeyName(title)

    try {
      setIsLoading(true)
      const eventData = {
        title: title,
        eventType: data.eventType,
        keyName: keyName,
      }
      const response = await axiosInstance.post('/api/events/create', eventData)
      if (response.status === 200) {
        toast.success('Event created successfully', {
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
      
      // Redirect to profile edit page if redirectToProfile is provided
      if (redirectToProfile) {
        router.push(
          `/${redirectToProfile.locale}/profile?section=admin-edit-event&eventKeyName=${response.data.keyName}`
        )
      } else {
        router.push(`/events/editEvent/${response.data.keyName}`)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error('Duplicate Event Title', {
            description: 'There is already an event with this title',
          })
        } else {
          toast.error('Error making request to database', {
            description:
              error.response?.data ||
              'Something went wrong. Please contact the admin',
          })
        }
      } else if (error instanceof Error) {
        toast.error(
          error?.message || 'Something went wrong. Please contact the admin.',
          {
            description: 'Error',
          }
        )
      } else {
        toast.error('Error', {
          description: 'Something went wrong. Please contact the admin.',
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
          Give a title to your Event
        </h1>
        <p className="text-sm text-muted-foreground">
          What would you like to name your Event? Do not worry, you can change
          this later.
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
                  Event Title
                </FormLabel>
                <FormDescription className="text-[11px]">
                  (This will be the keyname in URL path. To change, please
                  create a new event or ask dev team to update)
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="eg: My first post"
                    className="w-80 text-textColor xl:max-w-[400px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textColor-brand900 mr-2">
                  Event Type:
                </FormLabel>
                <FormDescription className="text-[11px]">
                  (For other event types, use &quot;Event&quot; or ask dev team
                  to add)
                </FormDescription>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        {field.value.length > 1 ? field.value : 'Select'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuLabel>Select Event Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        {...field}
                      >
                        <DropdownMenuRadioItem value="CLASS">
                          Class
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="CONCERT">
                          Concert
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="CAMPING">
                          Camping
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="EVENT">
                          Event
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-x-6">
            <Button
              variant={'outline'}
              size={'lg'}
              disabled={isLoading}
              className="text-md max-w-fit bg-bgColor-brand900 font-bold text-textColor-white hover:bg-bgColor-brand400 hover:text-textColor-white/90"
              type="submit"
            >
              Create Event
            </Button>
            <Link
              href={
                redirectToProfile
                  ? `/${redirectToProfile.locale}/profile?section=admin-all-events`
                  : '/events'
              }
            >
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

export default CreateEventForm
