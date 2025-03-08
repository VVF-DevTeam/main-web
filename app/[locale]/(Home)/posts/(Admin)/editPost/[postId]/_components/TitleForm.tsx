'use client'
import React, { useState } from 'react'
import { Post } from '@prisma/client'
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

interface PostTitleProps {
  post: Post
}

const PostTitleSchema = z.object({
  title: z
    .string()
    .min(10, { message: 'Chapter title must be at least 10 characters' }),
})

const PostTitle = ({ post }: PostTitleProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof PostTitleSchema>>({
    resolver: zodResolver(PostTitleSchema),
    defaultValues: {
      title: post?.title || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof PostTitleSchema>) => {
    try {
      await axios.put(`/api/posts/edit/${post.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Post title updated successfully',
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
    <div className="flex-col-default mt-4 w-full rounded-md bg-bgColor-gray/10 px-4 py-6">
      <div className="flex-between">
        <h1 className="text-xl font-semibold">Post Title</h1>
        <button
          onClick={() => setEditing(!editing)}
          className={cn(
            'text-sm font-semibold text-textColor-gray transition-all hover:text-textColor-brand',
            !editing && 'text-textColor-brand hover:text-textColor-gray'
          )}
        >
          {editing ? (
            <span>Cancel</span>
          ) : (
            <span className="flex-center gap-x-2">
              Edit Title <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {editing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !post?.title ? (
        <p className="italic text-textColor-gray">
          Add a title for this post.
        </p>
      ) : (
        <div>
          <p className="text-textColor-black/50">{post?.title}</p>
        </div>
      )}
    </div>
  )
}

export default PostTitle
