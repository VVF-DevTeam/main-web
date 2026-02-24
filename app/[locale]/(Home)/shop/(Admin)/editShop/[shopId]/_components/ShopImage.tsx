'use client'
import React, { useState } from 'react'
import { Shop } from '@prisma/client'
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
import Loader from '@/components/loader/Loader'
import { getValidGoogleDriveImageUrl } from '@/lib/utilFunctions/gdrive-loader'

interface ShopImageProps {
  shop: Shop
}

const ShopImageSchema = z.object({
  imageUrl: z.string().min(1, { message: 'Shop Image is required' }).optional(),
})

const ShopImage = ({ shop }: ShopImageProps) => {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof ShopImageSchema>>({
    resolver: zodResolver(ShopImageSchema),
    defaultValues: {
      imageUrl: shop?.imageUrl || '',
    },
  })
  const { isSubmitting, isValid } = form.formState
  const onSubmit = async (values: z.infer<typeof ShopImageSchema>) => {
    try {
      setIsLoading(true)
      await axiosInstance.put(`/api/shops/edit/${shop.id}`, values)
      setEditing(false)
      toast.success('Success', {
        description: 'Shop image updated successfully',
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Error', {
        description: 'Something went wrong',
        style: {
          color: '#ef4444', // red-500 color
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Shop Image</h1>
          <button
            onClick={() => setEditing(!editing)}
            disabled={isLoading}
            className={cn(
              'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
              !editing && 'text-[#C54B3E] hover:text-slate-700'
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
                name="imageUrl"
                render={({ field }) => {
                  const validUrl = getValidGoogleDriveImageUrl(field.value || '')
                  return (
                    <FormItem className="w-full">
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter Shop Image URL"
                            {...field}
                            onBlur={(e) => {
                              const raw = e.target.value || ''
                              const normalized = getValidGoogleDriveImageUrl(raw)
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
                                  alt="Shop image preview"
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <Button disabled={isSubmitting || !isValid || isLoading}>
                Save
              </Button>
            </form>
          </Form>
        ) : !shop?.imageUrl ? (
          <p className="text-sm italic text-muted-foreground text-slate-500">
            Add an image for this shop.
          </p>
        ) : (
          <div className="flex flex-col gap-y-4">
            <div className="relative mx-auto aspect-video h-[250px] w-[560px]">
              {(() => {
                const src =
                  getValidGoogleDriveImageUrl(shop.imageUrl || '') ||
                  shop.imageUrl
                return (
                  <Image
                    fill
                    src={src}
                    alt="Shop Image"
                    className="rounded-md object-cover"
                  />
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ShopImage


