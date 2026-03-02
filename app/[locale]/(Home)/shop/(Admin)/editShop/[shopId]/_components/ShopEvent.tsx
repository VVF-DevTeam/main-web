'use client'
import React, { useState, useEffect } from 'react'
import { Shop, ShopItem } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, X } from 'lucide-react'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { axiosInstance } from '@/lib/axios'
import { getAllPublishedEvents } from '@/lib/actions/event/getEvent'
import { getCurrentDateTime } from '@/lib/actions/date/getCurrentDateTime'

interface ShopEventProps {
    shop: Shop & {
        shopItems: ShopItem[]
        event?: {
            id: string
            title: string
            keyName: string
        } | null
    }
}

interface Event {
    id: string
    title: string
}

const ShopEventSchema = z.object({
    eventId: z.string().nullable(),
})

const ShopEvent = ({ shop }: ShopEventProps) => {
    const router = useRouter()
    const currentDateTime = getCurrentDateTime()
    const [editing, setEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
    const [eventSearchTerm, setEventSearchTerm] = useState('')

    const form = useForm<z.infer<typeof ShopEventSchema>>({
        resolver: zodResolver(ShopEventSchema),
        defaultValues: {
            eventId: shop?.eventId || null,
        },
    })

    const { isSubmitting, isValid } = form.formState

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const publishedEvents = await getAllPublishedEvents()
                setEvents(publishedEvents)
                setFilteredEvents(publishedEvents)
            } catch (error) {
                console.error('Error fetching events:', error)
            }
        }

        fetchEvents()
    }, [])

    const handleEventSearch = (searchTerm: string) => {
        if (searchTerm === '') {
            setFilteredEvents(events)
        } else {
            const filtered = events.filter((event) =>
                event.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredEvents(filtered)
        }
    }

    const onSubmit = async (values: z.infer<typeof ShopEventSchema>) => {
        try {
            setIsLoading(true)
            // Normalize empty string to null so we don't violate the FK constraint
            const payload = {
                ...values,
                eventId: values.eventId || null,
            }
            await axiosInstance.put(`/api/shops/edit/${shop.id}`, payload)
            toast.success('Shop event updated successfully', {
                description: (
                    <span style={{ color: 'var(--muted-foreground)' }}>
                        {currentDateTime}
                    </span>
                ),
                style: { color: '#22c55e' },
            })
            setEditing(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error('Error updating shop event', {
                description: (
                    <div className="flex flex-col gap-1">
                        <span>
                            {error instanceof Error
                                ? error.message
                                : 'Something went wrong. Please contact the admin.'}
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

    const handleClearEvent = () => {
        form.setValue('eventId', null)
    }

    return (
        <>
            {isLoading && <Loader />}
            <div className="flex w-full flex-col gap-y-6 rounded-md bg-slate-50 px-4 py-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Linked Event</h3>
                    <button
                        onClick={() => setEditing(!editing)}
                        className={cn(
                            'text-sm font-semibold text-slate-700 transition-all hover:text-red-700',
                            !editing && 'text-textColor-brand900 hover:text-slate-700'
                        )}
                        disabled={isLoading}
                    >
                        {editing ? (
                            <span>Cancel</span>
                        ) : (
                            <span className="flex items-center justify-center gap-x-2">
                                Edit <Pencil className="h-4 w-4" />
                            </span>
                        )}
                    </button>
                </div>

                {editing ? (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="eventId"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <div className="flex items-center gap-2">
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || undefined}
                                                disabled={isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="border">
                                                        <SelectValue placeholder="Select an event (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <div className="pb-2">
                                                        <Input
                                                            type="search"
                                                            autoComplete="off"
                                                            placeholder="Input value and press Enter to search"
                                                            value={eventSearchTerm}
                                                            onChange={(e) => {
                                                                setEventSearchTerm(e.target.value)
                                                            }}
                                                            onKeyDown={(e) => {
                                                                e.stopPropagation()
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault()
                                                                    handleEventSearch(eventSearchTerm)
                                                                }
                                                            }}
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                    {filteredEvents.map((event: Event) => (
                                                        <SelectItem key={event.id} value={event.id}>
                                                            {event.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleClearEvent}
                                                    className="h-10 w-10"
                                                    disabled={isLoading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button disabled={isSubmitting || !isValid || isLoading}>
                                Save
                            </Button>
                        </form>
                    </Form>
                ) : !shop?.event ? (
                    <p className="text-sm italic text-muted-foreground">
                        No event linked. You can optionally link this shop to an event.
                    </p>
                ) : (
                    <p className="text-muted-foreground">{shop.event.title}</p>
                )}
            </div>
        </>
    )
}

export default ShopEvent

