'use client'
import React, { useState } from 'react'
import { Shop } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

import Editor from '@/components/quill/Editor'
import TextPreview from '@/components/quill/TextPreview'
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
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Loader from '@/components/loader/Loader'

interface ShopDescriptionProps {
  shop: Shop
}

const ShopDescriptionSchema = z.object({
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' })
    .optional(),
})

const ShopDescription = ({ shop }: ShopDescriptionProps) => {
  const currentDateTime = getCurrentDateTime()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof ShopDescriptionSchema>>({
    resolver: zodResolver(ShopDescriptionSchema),
    defaultValues: {
      description: shop?.description || '',
    },
  })
  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof ShopDescriptionSchema>) => {
    try {
      setIsLoading(true)
      // update the shop description
      await axiosInstance.put(`/api/shops/edit/${shop.id}`, values)

      // send a success message
      setEditing(false)
      toast.success('Shop description updated successfully', {
        description: (
          <span style={{ color: 'var(--muted-foreground)' }}>
            {currentDateTime}
          </span>
        ),
        style: {
          color: '#22c55e', // green-500 color
        },
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong', {
        description: (
          <div className="flex flex-col gap-1">
            <span>
              {error instanceof Error
                ? error.message
                : 'Please try again later'}
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Shop Description</h1>
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
                Edit Description <Pencil className="h-4 w-4" />
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
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Editor onChange={field.onChange} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isSubmitting || !isValid || isLoading}>
                Save
              </Button>
            </form>
          </Form>
        ) : !shop?.description ? (
          <p className="text-sm italic text-muted-foreground text-slate-500">
            Add a description for this shop.
          </p>
        ) : (
          <div className="text-muted-foreground">
            <TextPreview value={shop.description} />
          </div>
        )}
      </div>
    </>
  )
}

export default ShopDescription


