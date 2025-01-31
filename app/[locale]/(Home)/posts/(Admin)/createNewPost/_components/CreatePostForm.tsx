'use client'
import { createPostSchema } from '@/lib/zodSchema/createPostSchema'
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
import { Input } from '@/components/ui/input'
import { Separator } from '@radix-ui/react-separator'
import { useToast } from '@/hooks/use-toast'

interface CreatePostFormProps {
  author: string
}
const CreatePostForm = ({ author }: CreatePostFormProps) => {
  
  const { toast } = useToast()
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
      const response = await axios.post('/api/posts/create', postData)
      if (response.status === 200) {
        toast({
          variant: 'default',
          title: 'Success',
          description: 'Post created successfully',
        })
      }

      form.reset()
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
    <div className="flex flex-col items-center gap-y-8">
      <div className="flex flex-col items-center gap-y-2">
        <h1 className="mb-2 text-2xl font-semibold text-[#1B171A]/80 lg:text-2xl xl:text-3xl">
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
                <FormLabel className="text-[#C54B3E]">Post Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="eg: My first post"
                    className="w-80 text-[#1B171A] xl:max-w-[400px]"
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
              variant={'outline'}
              size={'lg'}
              disabled={!isValid || isLoading}
              className="text-md max-w-fit bg-[#C54B3E] font-bold text-white hover:bg-[#C54B3E]/90 hover:text-white/90"
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
