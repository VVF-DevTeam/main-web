'use client'
// Libraries
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

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
import { useToast } from '@/hooks/use-toast'
import { axiosInstance } from '@/lib/axios'

// Interfaces
interface CreateEventFormProps {
  author: string
}
// TODO: Abstract the createEventSchema to a separate file
const createEventSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, { message: 'Title must be at least 2 characters long' })
    .max(20, { message: 'Title must be at most 20 characters long' }),
  eventType: z.string().min(1, { message: 'Event type is required' }),
})

// Main Component
const CreateEventForm = ({ author }: CreateEventFormProps) => {
  console.log(author)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      eventType: '',
    },
  })
  const { isValid, isLoading } = form.formState

  const onSubmit = async (data: z.infer<typeof createEventSchema>) => {
    console.log(data)

    //Format title to trims whitespaces
    const title = data.title.replace(/\s+/g, ' ').trim()

    // Format title to keyName, which is used for pathname
    const keyName = title.replace(/\s+/g, '-').toLowerCase()

    try {
      const eventData = {
        title: title,
        eventType: data.eventType,
        keyName: keyName,
      }
      const response = await axiosInstance.post('/api/events/create', eventData)
      if (response.status === 200) {
        toast({
          variant: 'default',
          title: 'Success',
          description: 'Event created successfully',
        })
      }

      form.reset()
      router.refresh()
      router.push(`/events/editEvent/${response.data.keyName}`)
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast({
            variant: 'destructive',
            title: 'Duplicate Event Title',
            description: 'There is already an event with this title',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Error making request to database',
            description:
              error.response?.data ||
              'Something went wrong. Please contact the admin',
          })
        }
      } else if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error?.message || 'Something went wrong. Please contact the admin.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please contact the admin.',
        })
      }
    }
  }

  return (
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
                <FormLabel className="text-textColor-brand">
                  Event Title
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: My first post"
                    className="w-80 text-textColor xl:max-w-[400px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>What is your event about?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mr-2 text-textColor-brand">
                  Event Type:
                </FormLabel>
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
              className="text-md max-w-fit bg-bgColor-brand font-bold text-textColor-white hover:bg-bgColor-brand/90 hover:text-textColor-white/90"
              type="submit"
            >
              Create Event
            </Button>
            <Link href={'/events'}>
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
  )
}

export default CreateEventForm
