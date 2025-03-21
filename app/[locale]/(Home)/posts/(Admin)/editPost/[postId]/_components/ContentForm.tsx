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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import Editor from '../../../../../../components/Editor'
import TextPreview from '../../../../../../components/TextPreview'

interface PostContentProps {
  post: Post
}

const PostContentSchema = z.object({
  content: z
    .string()
    .min(30, { message: 'Post content must be at least 30 characters' }),
})

const PostContent = ({ post }: PostContentProps) => {
  const { toast } = useToast()
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
      await axios.put(`/api/posts/edit/${post.id}`, values)
      setEditing(false)
      toast({
        variant: 'default',
        title: 'Success',
        description: 'Post content updated successfully',
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
    <div className="mt-4 w-full flex-col-default rounded-md bg-bgColor-gray/10 px-4 py-6">
      <div className="flex-between">
        <h1 className="text-xl font-semibold">Post Content</h1>
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
        <p className="text-sm italic text-textColor-gray">
          Add content for this post.
        </p>
      ) : (
        <div className="h-fit text-textColor-black/50">
          <TextPreview value={post?.content} />
        </div>
      )}
    </div>
  )
}

export default PostContent
