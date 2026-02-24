'use client'
import React, { useState } from 'react'
import { Shop } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

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
  FormDescription,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'
import Loader from '@/components/loader/Loader'

interface ShopSlugProps {
  shop: Shop
}

const ShopSlugSchema = z.object({
  slug: z
    .string()
    .min(1, { message: 'Slug is required' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
})

const ShopSlug = ({ shop }: ShopSlugProps) => {
  const router = useRouter()
  const currentDateTime = getCurrentDateTime()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof ShopSlugSchema>>({
    resolver: zodResolver(ShopSlugSchema),
    defaultValues: {
      slug: shop?.slug || '',
    },
  })

  const onSubmit = async (data: z.infer<typeof ShopSlugSchema>) => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.put(`/api/shops/edit/${shop.id}`, {
        slug: data.slug,
      })
      toast.success('Shop slug updated successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      console.log(response)
      setIsEditing(false)
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('409') || error.message.includes('duplicate')) {
          toast.error('Duplicate Slug', {
            description: (
              <div className="flex flex-col gap-1">
                <span>There is already a shop with this slug</span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        } else {
          toast.error('Error making request to database', {
            description: (
              <div className="flex flex-col gap-1">
                <span>
                  {error.message || 'Something went wrong. Please contact the admin'}
                </span>
                <span style={{ color: 'var(--muted-foreground)' }}>
                  {currentDateTime}
                </span>
              </div>
            ),
            style: {
              color: '#ef4444', // red-500 color
            },
          })
        }
      } else {
        toast.error('Error', {
          description: (
            <div className="flex flex-col gap-1">
              <span>Something went wrong. Please contact the admin.</span>
              <span style={{ color: 'var(--muted-foreground)' }}>
                {currentDateTime}
              </span>
            </div>
          ),
          style: {
            color: '#ef4444', // red-500 color
          },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Shop Slug</h3>
          <Button
            variant={null}
            onClick={() => setIsEditing(!isEditing)}
            disabled={isLoading}
            className={cn(
              isEditing
                ? 'font-semibold text-gray-700 transition-all duration-75 hover:text-red-700'
                : 'font-semibold text-red-700 transition-all duration-75 hover:text-gray-700'
            )}
          >
            {isEditing ? (
              'Cancel'
            ) : (
              <span className="flex gap-x-2">
                Edit <Pencil className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>

        {/* FORM */}
        <div>
          {isEditing ? (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    name="slug"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            className="bg-white p-2 text-gray-900"
                            placeholder="e.g., vvf-merch-store"
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          URL-friendly identifier (lowercase letters, numbers, and hyphens only)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant={'default'} className="mt-6" disabled={isLoading}>
                    Save
                  </Button>
                </form>
              </Form>
            </>
          ) : !shop.slug ? (
            <p className="italic text-muted-foreground text-slate-500">
              Add a slug for this shop.
            </p>
          ) : (
            <p className="text-muted-foreground">{shop.slug}</p>
          )}
        </div>
      </div>
    </>
  )
}

export default ShopSlug

