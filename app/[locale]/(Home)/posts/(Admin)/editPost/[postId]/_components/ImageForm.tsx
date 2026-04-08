'use client'
import React, { useState } from 'react'
import { Post } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

import Loader from '@/components/loader/Loader'
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
import { getValidGoogleDriveImageUrl } from '@/lib/utilFunctions/gdrive-loader'
import { ImageUploadButton } from '@/components/button/ImageUploadButton'

interface PostImageProps {
  post: Post
}

const PostImageSchema = z.object({
  imgUrl: z.string().min(1, { message: 'Post Image is required' }),
})

const PostImage = ({ post }: PostImageProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof PostImageSchema>>({
    resolver: zodResolver(PostImageSchema),
    defaultValues: {
      imgUrl: post?.imgUrl || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof PostImageSchema>) => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0]) return

    setIsLoading(true)
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axiosInstance.post(
        '/api/posts/images',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if (response.status === 200) {
        form.setValue(
          'imgUrl',
          getValidGoogleDriveImageUrl(response.data.url) ?? response.data.url,
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          }
        )
        toast.success('Success', {
          description: 'Image uploaded successfully',
          style: { color: '#22c55e' },
        })
      } else {
        toast.error('Error', {
          description: 'Failed to upload image',
          style: { color: '#ef4444' },
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error', {
        description: 'Failed to upload image',
        style: { color: '#ef4444' },
      })
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex-col-default mt-4 w-full rounded-md bg-bgColor-gray100 px-4 py-6">
        <div className="flex-between">
          <h1 className="text-xl font-semibold">Post Image</h1>
          <button
            onClick={() => setEditing(!editing)}
            className={cn(
              'text-sm font-semibold text-textColor-gray500 transition-all hover:text-textColor-brand900',
              !editing && 'text-textColor-brand900 hover:text-textColor-gray500'
            )}
            disabled={isLoading}
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
              className="space-y-2"
            >
              <FormField
                control={form.control}
                name="imgUrl"
                render={({ field }) => {
                  const validUrl = getValidGoogleDriveImageUrl(field.value)
                  return (
                    <FormItem className="w-full">
                      <FormControl>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Input
                              placeholder="Enter Image URL"
                              {...field}
                              disabled={isLoading}
                              onBlur={(e) => {
                                const raw = e.target.value || ''
                                const normalized =
                                  getValidGoogleDriveImageUrl(raw)
                                if (normalized && normalized !== field.value) {
                                  field.onChange(normalized)
                                }
                                field.onBlur()
                              }}
                            />
                            {field.value && (
                              <div className="relative aspect-video max-w-xl">
                                {validUrl ? (
                                  <Image
                                    fill
                                    src={validUrl}
                                    alt="Post image preview"
                                    className="rounded-md object-cover"
                                  />
                                ) : (
                                  <p className="text-xs text-textColor-red">
                                    Invalid Google Drive image URL
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <ImageUploadButton
                            onChange={handlePostImageUpload}
                            disabled={isLoading || isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <Button disabled={isSubmitting || !isValid || isLoading}>Save</Button>
            </form>
          </Form>
        ) : !post?.imgUrl ? (
          <p className="text-sm italic text-textColor-gray500">
            Add an image for this post.
          </p>
        ) : (
          <div className="relative mx-auto aspect-video h-full max-h-[900px] w-full max-w-[900px]">
            {(() => {
              const src =
                getValidGoogleDriveImageUrl(post.imgUrl) || post.imgUrl
              return (
                <Image
                  fill
                  src={src}
                  alt="Post Image"
                  className="absolute mt-4 rounded-lg object-cover"
                />
              )
            })()}
          </div>
        )}
      </div>
    </>
  )
}

export default PostImage
