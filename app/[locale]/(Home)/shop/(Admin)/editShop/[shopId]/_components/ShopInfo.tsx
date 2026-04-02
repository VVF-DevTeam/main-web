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
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { axiosInstance } from '@/lib/axios'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'
import Loader from '@/components/loader/Loader'

interface ShopInfoProps {
    shop: Shop
}

const ShopInfoSchema = z.object({
    contactEmail: z
        .string({ required_error: 'Contact email is required' })
        .email({ message: 'Invalid email address' }),
    contactPhone: z
        .string()
        .optional()
        .refine((val) => !val || val.length >= 3, {
            message: 'Contact phone must be at least 3 characters',
        }),
    termsAndConditions: z
        .string()
        .min(10, { message: 'Terms and Conditions must be at least 10 characters' })
        .optional(),
})

const ShopInfo = ({ shop }: ShopInfoProps) => {
    const router = useRouter()
    const currentDateTime = getCurrentDateTime()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof ShopInfoSchema>>({
        resolver: zodResolver(ShopInfoSchema),
        defaultValues: {
            contactEmail: shop?.contactEmail || '',
            contactPhone: shop?.contactPhone || '',
            termsAndConditions: shop?.termsAndConditions || '',
        },
    })

    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (values: z.infer<typeof ShopInfoSchema>) => {
        try {
            setIsLoading(true)
            await axiosInstance.put(`/api/shops/edit/${shop.id}`, values)
            toast.success('Shop info updated successfully', {
                description: (
                    <span style={{ color: 'var(--muted-foreground)' }}>
                        {currentDateTime}
                    </span>
                ),
                style: { color: '#22c55e' },
            })
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong', {
                description: (
                    <div className="flex flex-col gap-1">
                        <span>
                            {error instanceof Error ? error.message : 'Please try again later'}
                        </span>
                        <span style={{ color: 'var(--muted-foreground)' }}>
                            {currentDateTime}
                        </span>
                    </div>
                ),
                style: { color: '#ef4444' },
            })
        } finally {
            setIsLoading(false)
        }
    }

    const hasAnyInfo =
        !!shop.contactEmail || !!shop.contactPhone || !!shop.termsAndConditions

    return (
        <>
            {isLoading && <Loader />}
            <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Shop Info</h3>
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

                {isEditing ? (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                name="contactEmail"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                className="bg-white"
                                                placeholder="e.g., shop@vvf.ca"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[11px]">
                                            Required - used for customer inquiries.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="contactPhone"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Phone</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isLoading}
                                                className="bg-white"
                                                placeholder="e.g., +1 604 555 0123"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[11px]">
                                            Optional - displayed on shop page if you want.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                name="termsAndConditions"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Terms and Conditions</FormLabel>
                                        <FormControl>
                                            <Editor
                                                onChange={field.onChange}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-[11px]">
                                            Optional — add your terms & conditions / refund policy
                                            text.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button disabled={isSubmitting || !isValid || isLoading}>
                                Save
                            </Button>
                        </form>
                    </Form>
                ) : !hasAnyInfo ? (
                    <p className="italic text-muted-foreground text-slate-500">
                        Add contact information and/or terms and conditions for this shop.
                    </p>
                ) : (
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div>
                            <span className="font-semibold">Email:</span>{' '}
                            {shop.contactEmail || '—'}
                        </div>
                        <div>
                            <span className="font-semibold">Phone:</span>{' '}
                            {shop.contactPhone || '—'}
                        </div>
                        <div>
                            <span className="font-semibold">Terms and Conditions:</span>
                            <div className="mt-2">
                                {shop.termsAndConditions ? (
                                    <TextPreview value={shop.termsAndConditions} />
                                ) : (
                                    <span>—</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default ShopInfo

