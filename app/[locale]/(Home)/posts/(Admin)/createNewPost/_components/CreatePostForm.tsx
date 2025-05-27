'use client'
// Libraries
import { createPostSchema } from '@/lib/zodSchema/createPostSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
import { Input } from '@/components/ui/input'
import { Separator } from '@radix-ui/react-separator'
import { axiosInstance } from '@/lib/axios'

// Interfaces
interface CreatePostFormProps {
  author: string
}

// Main Component
const CreatePostForm = ({ author }: CreatePostFormProps) => {
  const router = useRouter()

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
    },
  })
  const { isValid, isLoading } = form.formState

  const onSubmit = async (data: z.infer<typeof createPostSchema>) => {
    try {
      const postData = {
        title: data.title,
        userId: author,
      }
      const response = await axiosInstance.post('/api/posts/create', postData)
      if (response.status === 200) {
        toast.success('Post created successfully')
      }

      form.reset()
      router.refresh()
      router.push(`/posts/editPost/${response.data.id}`)
    } catch (error) {
      console.log(error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error('Duplicate Post', { description: 'There is already a post with this title' })
        } else {
          toast.error('Error making request to database', { description: 'Something went wrong. Please contact the admin' })
        }
      } else {
        toast.error('Error', { description: 'Something went wrong. Please contact the admin' })
      }
    }
  }

  return (
    <div className="flex-col-center default-gap">
      <div className="flex-col-center gap-y-2">
        <h1 className="header-text header mb-2 font-semibold">
          Give a title to your post
        </h1>
        <p className="text-sm text-muted-foreground">
          What would you like to name your post? Do not worry, you can change
          this later
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
                  Post Title
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: My first post"
                    className="w-80 text-textColor xl:max-w-[400px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>What is your post about?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-x-6">
            <Button
              variant={'default'}
              size={'lg'}
              disabled={!isValid || isLoading}
              className="text-md max-w-fit"
              type="submit"
            >
              Create Post
            </Button>
            <Link href={'/posts'}>
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

export default CreatePostForm
