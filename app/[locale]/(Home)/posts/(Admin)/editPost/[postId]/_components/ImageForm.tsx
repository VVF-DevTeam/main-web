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
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import Image from 'next/image'
import { axiosInstance } from '@/lib/axios'

interface PostImageProps {
  post: Post
}

const PostImageSchema = z.object({
  imgUrl: z.string().min(1, { message: 'Post Image is required' }),
})

const PostImage = ({ post }: PostImageProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const form = useForm<z.infer<typeof PostImageSchema>>({
    resolver: zodResolver(PostImageSchema),
    defaultValues: {
      imgUrl: post?.imgUrl || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof PostImageSchema>) => {
    console.log(values)
    try {
      await axiosInstance.put(`/api/posts/edit/${post.id}`, values)
      setEditing(false)
      toast.success('Success', {
        description: 'Post image updated successfully',
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
        <h1 className="text-xl font-semibold">Post Image</h1>
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
            <span className="flex items-center justify-center gap-x-2">
              Edit Image <Pencil className="h-4 w-4" />
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
              name="imgUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input placeholder="Enter Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || !isValid}>Save</Button>
          </form>
        </Form>
      ) : !post?.imgUrl ? (
        <p className="text-sm italic text-textColor-gray500">
          Add an image for this post.
        </p>
      ) : (
        <div className="relative mx-auto aspect-video h-full max-h-[900px] w-full max-w-[900px]">
          <Image
            fill
            src={post?.imgUrl}
            alt="Post Image"
            className="absolute mt-4 rounded-lg object-cover"
          ></Image>
        </div>
      )}
    </div>
  )
}

export default PostImage
