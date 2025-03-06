'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface CreateEventFormProps {
  author: string
}
// TODO: Abstract the createEventSchema to a separate file
const createEventSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, { message: 'Title is required' })
    .max(20, { message: 'Title must be at most 20 characters long' }),
  eventType: z.string().min(1, { message: 'Event type is required' }),
})

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
    try {
      const eventData = {
        title: data.title,
        eventType: data.eventType,
      }
      const response = await axios.post('/api/events/create', eventData)
      if (response.status === 200) {
        toast({
          variant: 'default',
          title: 'Success',
          description: 'Event created successfully',
        })
      }

      form.reset()
      router.refresh()
      router.push(`/events/editEvent/${response.data.id}`)
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
                <FormLabel className="text-[#C54B3E]">Event Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: My first post"
                    className="w-80 text-[#1B171A] xl:max-w-[400px]"
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
                <FormLabel className="mr-2 text-[#C54B3E]">
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
              className="text-md max-w-fit bg-[#C54B3E] font-bold text-white hover:bg-[#C54B3E]/90 hover:text-white/90"
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
