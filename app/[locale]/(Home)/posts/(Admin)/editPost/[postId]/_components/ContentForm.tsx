'use client'
import React, { useState } from 'react'
import { Post } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import Editor from '../../../../../../../../components/quill/Editor'
import TextPreview from '../../../../../../../../components/quill/TextPreview'
import { axiosInstance } from '@/lib/axios'

interface PostContentProps {
  post: Post
}

const PostContentSchema = z.object({
  content: z
    .string()
    .min(30, { message: 'Post content must be at least 30 characters' }),
})

const PostContent = ({ post }: PostContentProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof PostContentSchema>>({
    resolver: zodResolver(PostContentSchema),
    defaultValues: {
      content: post?.content || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof PostContentSchema>) => {
    try {
      await axiosInstance.put(`/api/posts/edit/${post.id}`, values)
      setEditing(false)
      toast.success('Success', {
        description: 'Post content updated successfully',
        style: {
          color: '#22c55e' // green-500 color
        }
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Error', {
        description: 'Something went wrong',
        style: {
          color: '#ef4444' // red-500 color
        }
      })
    }
  }

  return (
    <div className="flex-col-default mt-4 w-full rounded-md bg-bgColor-gray100 px-4 py-6">
      <div className="flex-between">
        <h1 className="text-xl font-semibold">Post Content</h1>
        <button
          onClick={() => setEditing(!editing)}
          className={cn(
            'text-sm font-semibold text-textColor-gray500 transition-all hover:text-textColor-brand900',
            !editing && 'text-textColor-brand900 hover:text-textColor-gray500'
          )}
        >
          {editing ? (
            <span>Cancel</span>
          ) : (
            <span className="flex-center gap-x-2">
              Edit Content <Pencil className="h-4 w-4" />
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
              name="content"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Editor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !post?.content ? (
        <p className="text-sm italic text-textColor-gray500">
          Add content for this post.
        </p>
      ) : (
        <div className="text-textColor-black/50 h-fit">
          <TextPreview value={post?.content} />
        </div>
      )}
    </div>
  )
}

export default PostContent
