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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'

interface PostSummaryProps {
  post: Post
}

const PostSummarySchema = z.object({
  summary: z.string().min(10, { message: 'Post Summary is required' }),
})

const PostSummary = ({ post }: PostSummaryProps) => {
  const { toast } = useToast()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof PostSummarySchema>>({
    resolver: zodResolver(PostSummarySchema),
    defaultValues: {
      summary: post?.summary || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof PostSummarySchema>) => {
    try {
      await axiosInstance.put(`/api/posts/edit/${post.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Post summary updated successfully',
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
        <h1 className="text-xl font-semibold">Post Summary</h1>
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
            <span className="flex items-center justify-center gap-x-2">
              Edit Summary <Pencil className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
      {editing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      placeholder="Type here"
                      className="h-[80px] resize"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !post?.summary ? (
        <p className="text-sm italic text-textColor-brand">
          Add a summary for this post.
        </p>
      ) : (
        <div>
          <p className="text-textColor-black/50">{post?.summary}</p>
        </div>
      )}
    </div>
  )
}

export default PostSummary
