'use client'
import React, { useState } from 'react'
import { Shop, ShopType as PrismaShopType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

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
import Loader from '@/components/loader/Loader'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface ShopTypeProps {
    shop: Shop
}

const shopTypeSchema = z.object({
    type: z.nativeEnum(PrismaShopType),
})

const SHOP_TYPE_OPTIONS = Object.values(PrismaShopType)

const ShopType = ({ shop }: ShopTypeProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()
    const currentDateTime = getCurrentDateTime()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof shopTypeSchema>>({
        resolver: zodResolver(shopTypeSchema),
        defaultValues: {
            type: shop.type || PrismaShopType.General,
        },
    })

    const onSubmit = async (data: z.infer<typeof shopTypeSchema>) => {
        try {
            setIsLoading(true)
            await axiosInstance.put(`/api/shops/edit/${shop.id}`, { type: data.type })
            toast.success('Shop type updated successfully', {
                description: (
                    <span style={{ color: 'var(--muted-foreground)' }}>
                        {currentDateTime}
                    </span>
                ),
                style: {
                    color: '#22c55e',
                },
            })
            setIsEditing(false)
            router.refresh()
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Something went wrong. Please contact the admin.'

            toast.error('Error updating shop type', {
                description: (
                    <div className="flex flex-col gap-1">
                        <span>{message}</span>
                        <span style={{ color: 'var(--muted-foreground)' }}>
                            {currentDateTime}
                        </span>
                    </div>
                ),
                style: {
                    color: '#ef4444',
                },
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {isLoading && <Loader />}
            <div className="flex flex-col gap-y-4 rounded-md bg-slate-50 px-4 py-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Shop Type</h3>
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
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                name="type"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger className="w-full bg-white md:w-[300px]">
                                                    <SelectValue placeholder="Select shop type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SHOP_TYPE_OPTIONS.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button variant={'default'} className="mt-6" disabled={isLoading}>
                                Save
                            </Button>
                        </form>
                    </Form>
                ) : (
                    <p className="text-muted-foreground">{shop.type}</p>
                )}
            </div>
        </>
    )
}

export default ShopType


