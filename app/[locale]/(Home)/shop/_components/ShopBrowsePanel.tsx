"use client"

import React, { useMemo, useState, useCallback, useEffect } from "react"
import {
    ChevronRight,
    RotateCcw,
    ShoppingCart,
    ArrowLeft,
    ArrowRight,
    ShoppingBag,
    Search,
} from "lucide-react"
import Image from 'next/image'
import TextPreview from '@/components/quill/TextPreview'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import ShoppingSheetCheckout from './ShoppingSheetCheckout'
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import { checkSubscription } from '@/lib/actions/payment/checkSubscription'
import { UserInfoProps } from '@/lib/types/userInfo'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { JsonValue } from "@prisma/client/runtime/library"

type ShopItemFilterData = {
    id: string
    title: string
    type: 'General' | 'Limit' | 'Discount'
    // Tag titles for this item
    tags: string[]
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'COMING_SOON'
    isFeatured: boolean
    imageUrl?: string | null
    images?: string[]
    price: number | string
    currency: string
    discountMemberPercent?: number | null
    description?: string | null
    updatedAt: Date | string
    stripePriceId?: string | null
    stripeProductId?: string | null
    subscribedStripePriceId?: string | null
}

type ShopType = 'General' | 'Food' | 'Clothes' | 'Event' | 'Fundraiser' | 'Digital' | 'Seasonal'

type ShopWithItems = {
    id: string
    title: string
    slug?: string | null
    imageUrl?: string | null
    type: ShopType
    isPublished: boolean
    sortOrder: number | null
    shopItems: ShopItemFilterData[]
    event?: {
        title: string
    } | null
    shopDiscounts?: JsonValue
}

type CartItem = {
    item: ShopItemFilterData
    quantity: number
    shopId: string
    shopTitle: string
}

interface ShopBrowsePanelProps {
    shops: ShopWithItems[]
    initialShopSlug?: string
}

const ITEM_STATUS_LABELS: Record<ShopItemFilterData['status'], string> = {
    AVAILABLE: 'Available',
    OUT_OF_STOCK: 'Out Of Stock',
    DISCONTINUED: 'Discontinued',
    COMING_SOON: 'Coming Soon',
}

const SORT_OPTIONS = [
    { value: 'featured', label: 'Featured' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
] as const

const SHOP_ITEM_TYPE_OPTIONS: ShopItemFilterData['type'][] = [
    'General',
    'Limit',
    'Discount',
]

const ITEM_STATUS_OPTIONS: ShopItemFilterData['status'][] = [
    'AVAILABLE',
    'OUT_OF_STOCK',
    'DISCONTINUED',
    'COMING_SOON',
]

const SHOP_TYPE_OPTIONS: ShopType[] = [
    'General',
    'Food',
    'Clothes',
    'Event',
    'Fundraiser',
    'Digital',
    'Seasonal',
]

const DEFAULT_SHOP_HEADER_IMAGE =
    'https://drive.google.com/thumbnail?id=1PXKYQic5fhczpFJjMHPK4AyYTjSC-zya'

const getAllFilteredItems = (
    shops: ShopWithItems[],
    selectedShopId: string,
    selectedType: string,
    selectedTag: string,
    selectedStatus: string
) => {
    const scopedItems: ShopItemFilterData[] = shops
        .filter((shop) => (selectedShopId ? shop.id === selectedShopId : true))
        .flatMap((shop) => shop.shopItems)

    return scopedItems.filter((item) => {
        const typePass = selectedType ? item.type === selectedType : true
        const tagPass = selectedTag ? item.tags.includes(selectedTag) : true
        const statusPass = selectedStatus ? item.status === selectedStatus : true
        return typePass && tagPass && statusPass
    })
}

// Carousel component for shop items
function ShopItemCarousel({
    items,
    onItemClick,
    onAddToCart,
}: {
    items: ShopItemFilterData[]
    onItemClick: (item: ShopItemFilterData) => void
    onAddToCart: (item: ShopItemFilterData) => void
}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    // @ts-ignore: useTranslation will always throw an error for typescript
    const { t } = useTranslation(['shop'])
    // Calculate items per view based on screen size
    const getItemsPerView = useCallback(() => {
        if (typeof window === 'undefined') return 1
        const width = window.innerWidth
        if (width >= 1280) return 5 // xl
        if (width >= 1024) return 4 // lg
        if (width >= 768) return 3 // md
        return 2 // sm (default)
    }, [])

    const [itemsPerView, setItemsPerView] = useState(() => getItemsPerView())

    // Update on resize
    useEffect(() => {
        const handleResize = () => {
            setItemsPerView(getItemsPerView())
        }
        handleResize() // Set initial value
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [getItemsPerView]) // Need useCallback so this doesn't change on every render

    // Calculate max index - can scroll until the last item is visible
    const maxIndex = Math.max(0, items.length - itemsPerView)

    const changeSlide = (direction: 'left' | 'right') => {
        setCurrentIndex((prev) => {
            if (direction === 'left') {
                return prev === 0 ? maxIndex : prev - 1
            } else {
                return prev >= maxIndex ? 0 : prev + 1
            }
        })
    }

    if (items.length === 0) return null

    // Calculate the percentage to move per item (100% / itemsPerView)
    const itemWidthPercent = 100 / itemsPerView

    return (
        <div className="relative w-full overflow-hidden rounded-lg">
            <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * itemWidthPercent}%)` }}
            >
                {/* All items in a single row */}
                {items.map((item) => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                    const formattedPrice = isNaN(price) ? '0.00' : price.toFixed(2)

                    return (
                        <div
                            key={item.id}
                            className="flex-shrink-0 px-1 lg:px-2"
                            style={{ width: `${itemWidthPercent}%` }}
                        >
                            <div
                                className="bg-white rounded-lg shadow-sm overflow-hidden h-full cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-md"
                                onClick={() => onItemClick(item)}
                            >
                                {/* Image Container */}
                                <div className="relative w-full h-48 bg-gray-100">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}

                                    {/* Tags in top left */}
                                    {item.tags.length > 0 && (
                                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                            {item.tags.slice(0, 2).map((tag, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="text-xs bg-white/90 text-gray-700"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-2">
                                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]">
                                        {item.title}
                                    </h3>

                                    {/* Item Type under title */}
                                    <p className="text-sm text-gray-500">
                                        {t(ITEM_STATUS_LABELS[item.status])} • {t(item.type)}
                                    </p>

                                    {/* Price and Add Button */}
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-base font-bold text-gray-900 shrink-0 pr-2">
                                            ${formattedPrice} {item.currency}
                                        </span>
                                        <Button
                                            size="sm"
                                            className="bg-bgColor-brand900 hover:bg-bgColor-brand600 text-white shrink min-w-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onAddToCart(item)
                                            }}
                                        >
                                            <ShoppingCart className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('add')}</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Navigation Buttons */}
            {items.length > itemsPerView && (
                <>
                    <button
                        aria-label="prev-items"
                        onClick={() => changeSlide('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-2 text-white opacity-75 transition-all hover:bg-black/70 hover:opacity-100"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <button
                        aria-label="next-items"
                        onClick={() => changeSlide('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-2 text-white opacity-75 transition-all hover:bg-black/70 hover:opacity-100"
                    >
                        <ArrowRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Indicators - show dots for each possible position */}
            {items.length > itemsPerView && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                        <span
                            key={idx}
                            className={`inline-block h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-bgColor-brand900 w-2' : 'bg-gray-400 w-2'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function ShopBrowsePanel({ shops, initialShopSlug }: ShopBrowsePanelProps) {
    // @ts-ignore: useTranslation will always throw an error for typescript
    const { t } = useTranslation(['shop'])
    // Only show published shops in the browse UI, ordered by sortOrder (lower first),
    // and randomize order between shops that share the same sortOrder.
    const publishedShops = useMemo(() => {
        const published = shops.filter((shop) => shop.isPublished)

        return published.sort((a, b) => {
            const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER
            const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER

            if (aOrder !== bOrder) {
                return aOrder - bOrder
            }

            // Same sortOrder: randomize relative order
            return Math.random() - 0.5
        })
    }, [shops])
    const [selectedShopId, setSelectedShopId] = useState<string>('')

    // Auto-select shop from URL param (e.g. coming from profile order history link)
    useEffect(() => {
        if (!initialShopSlug) return
        const match = publishedShops.find(
            (shop) => shop.slug === initialShopSlug || shop.title === initialShopSlug
        )
        if (match) {
            setSelectedShopId(match.id)
        } else {
            toast.error(t('shop-not-found'),
                {
                    description: (
                        <span style={{ color: 'var(--muted-foreground)' }}>
                            {t('shop-not-found-description')}
                        </span>
                    ),
                    style: {
                        color: '#ef4444', // red-500 color
                    }
                }
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialShopSlug, publishedShops.length])
    const [selectedShopType, setSelectedShopType] = useState<string>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [selectedTag, setSelectedTag] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [selectedSort, setSelectedSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('featured')
    const [selectedItem, setSelectedItem] = useState<ShopItemFilterData | null>(null)
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null)
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null)

    const openImageModal = (imageUrl: string) => setModalImageUrl(imageUrl)
    const closeImageModal = () => setModalImageUrl(null)
    const handleModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) closeImageModal()
    }
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return []
        try {
            const saved = localStorage.getItem('shop_cart')
            return saved ? (JSON.parse(saved) as CartItem[]) : []
        } catch {
            return []
        }
    })
    const [isCartSheetOpen, setIsCartSheetOpen] = useState(false)
    const [userInfo, setUserInfo] = useState<UserInfoProps | null>(null)
    const [isSubscribed, setIsSubscribed] = useState(false)
    // Which shop's checkout is active inside the cart sheet (only used in all-shops view)
    const [activeShopIdInSheet, setActiveShopIdInSheet] = useState<string | null>(null)

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('shop_cart', JSON.stringify(cartItems))
        } catch {
            // Storage quota exceeded or unavailable — silently ignore
        }
    }, [cartItems])

    // Fetch user info
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const info = await getCurrentUserInfo()
                setUserInfo(info)
            } catch {
                setUserInfo(null)
            }
        }
        fetchUserInfo()
    }, [])

    // Fetch subscription status once userInfo is available
    useEffect(() => {
        if (!userInfo?.id) {
            setIsSubscribed(false)
            return
        }
        let isMounted = true
        checkSubscription(userInfo.id)
            .then((subscribed) => {
                if (isMounted) setIsSubscribed(Boolean(subscribed))
            })
            .catch(() => {
                if (isMounted) setIsSubscribed(false)
            })
        return () => { isMounted = false }
    }, [userInfo?.id])

    const handleAddItemToCart = useCallback((item: ShopItemFilterData, shopId: string, shopTitle: string) => {
        setCartItems((prev) => {
            const existingIndex = prev.findIndex((ci) => ci.item.id === item.id)
            if (existingIndex !== -1) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1,
                }
                return updated
            }
            return [...prev, { item, quantity: 1, shopId, shopTitle }]
        })

        setIsCartSheetOpen(true)
    }, [])

    const handleRemoveCartItem = useCallback((itemId: string) => {
        setCartItems((prev) => prev.filter((ci) => ci.item.id !== itemId))
    }, [])

    const cartItemCount = useMemo(
        () => cartItems.reduce((sum, ci) => sum + ci.quantity, 0),
        [cartItems]
    )

    // The shop whose checkout is currently shown inside the cart sheet
    const activeCheckoutShop = useMemo(() => {
        const id = selectedShopId || activeShopIdInSheet
        return id ? publishedShops.find((shop) => shop.id === id) ?? null : null
    }, [publishedShops, selectedShopId, activeShopIdInSheet])

    // Cart items grouped by shop for the all-shops preview
    const cartItemsByShop = useMemo(() => {
        const map = new Map<string, { shopId: string; shopTitle: string; items: CartItem[] }>()
        cartItems.forEach((ci) => {
            if (!map.has(ci.shopId)) {
                map.set(ci.shopId, { shopId: ci.shopId, shopTitle: ci.shopTitle, items: [] })
            }
            map.get(ci.shopId)!.items.push(ci)
        })
        return Array.from(map.values())
    }, [cartItems])

    const checkoutItems = useMemo(() => {
        const shopId = activeCheckoutShop?.id
        const relevantItems = shopId
            ? cartItems.filter((ci) => ci.shopId === shopId)
            : cartItems
        return relevantItems
            .map(({ item, quantity }) => ({
                id: item.id,
                title: item.title,
                price: item.price,
                currency: item.currency,
                stripePriceId: item.stripePriceId ?? '',
                stripeProductId: item.stripeProductId ?? '',
                discountMemberPercent: item.discountMemberPercent ?? null,
                subscribedStripePriceId: item.subscribedStripePriceId ?? null,
                quantity,
                imageUrl: item.imageUrl,
            }))
            .filter((ci) => ci.stripePriceId && ci.stripeProductId)
    }, [cartItems, activeCheckoutShop])

    const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
        setCartItems((prev) =>
            prev.map((ci) =>
                ci.item.id === itemId ? { ...ci, quantity } : ci
            )
        )
    }, [])

    const handleCartSheetOpenChange = (open: boolean) => {
        setIsCartSheetOpen(open)
        if (!open) setActiveShopIdInSheet(null)
    }

    const selectedShop = useMemo(
        () => publishedShops.find((shop) => shop.id === selectedShopId) ?? null,
        [publishedShops, selectedShopId]
    )

    const shopsGroupedByType = useMemo(() => {
        const filteredShops = selectedShopType
            ? publishedShops.filter((shop) => shop.type === selectedShopType)
            : publishedShops

        const grouped: Record<ShopType, ShopWithItems[]> = {} as Record<ShopType, ShopWithItems[]>
        SHOP_TYPE_OPTIONS.forEach((type) => {
            grouped[type] = []
        })
        filteredShops.forEach((shop) => {
            if (grouped[shop.type]) {
                grouped[shop.type].push(shop)
            } else {
                grouped.General.push(shop)
            }
        })
        return grouped
    }, [publishedShops, selectedShopType])

    const allTypes = useMemo(
        () => SHOP_ITEM_TYPE_OPTIONS,
        []
    )

    const allTags = useMemo(() => {
        if (selectedShopId) {
            // Only show tags from the selected shop's items
            const selectedShop = publishedShops.find((shop) => shop.id === selectedShopId)
            if (!selectedShop) return []
            return Array.from(
                new Set(
                    selectedShop.shopItems.flatMap((item) => item.tags.filter((tag) => tag.trim() !== ''))
                )
            )
        }
        // Show all tags when no shop is selected
        return Array.from(
            new Set(
                publishedShops.flatMap((shop) =>
                    shop.shopItems.flatMap((item) => item.tags.filter((tag) => tag.trim() !== ''))
                )
            )
        )
    }, [publishedShops, selectedShopId])

    const allStatuses = useMemo(
        () => ITEM_STATUS_OPTIONS,
        []
    )

    const filteredItems = useMemo(
        () =>
            getAllFilteredItems(
                publishedShops,
                selectedShopId,
                selectedType,
                selectedTag,
                selectedStatus
            ),
        [publishedShops, selectedShopId, selectedType, selectedTag, selectedStatus]
    )

    const STATUS_SORT_ORDER: Record<ShopItemFilterData['status'], number> = {
        AVAILABLE: 0,
        COMING_SOON: 1,
        OUT_OF_STOCK: 2,
        DISCONTINUED: 3,
    }

    const sortedItems = useMemo(() => {
        const cloned = [...filteredItems]
        if (selectedSort === 'title-asc') {
            return cloned.sort((a, b) =>
                Number(b.isFeatured) - Number(a.isFeatured) ||
                STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status] ||
                a.title.localeCompare(b.title)
            )
        }
        if (selectedSort === 'title-desc') {
            return cloned.sort((a, b) =>
                Number(b.isFeatured) - Number(a.isFeatured) ||
                STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status] ||
                b.title.localeCompare(a.title)
            )
        }
        return cloned.sort((a, b) =>
            Number(b.isFeatured) - Number(a.isFeatured) ||
            STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]
        )
    }, [filteredItems, selectedSort])

    // Get up to 6 featured items per shop (or latest updated if not enough featured)
    // Also applies item filters (type, tag, status) when no shop is selected
    const featuredItemsByShop = useMemo(() => {
        const result: Array<{ shop: ShopWithItems; items: ShopItemFilterData[] }> = []

        publishedShops.forEach((shop) => {
            if (shop.shopItems.length === 0) return

            // Filter by selected shop type
            if (selectedShopType && shop.type !== selectedShopType) return

            // Apply filters to shop items
            let filteredShopItems = shop.shopItems.filter((item) => {
                const typePass = selectedType ? item.type === selectedType : true
                const tagPass = selectedTag ? item.tags.includes(selectedTag) : true
                const statusPass = selectedStatus ? item.status === selectedStatus : true
                return typePass && tagPass && statusPass
            })

            if (filteredShopItems.length === 0) return

            // Get featured items from filtered items
            const featuredItems = filteredShopItems.filter((item) => item.isFeatured)

            // Sort by updatedAt (desc) for both featured and non-featured
            const sortedAllItems = [...filteredShopItems].sort((a, b) => {
                const dateA = typeof a.updatedAt === 'string' ? new Date(a.updatedAt).getTime() : new Date(a.updatedAt).getTime()
                const dateB = typeof b.updatedAt === 'string' ? new Date(b.updatedAt).getTime() : new Date(b.updatedAt).getTime()
                return dateB - dateA
            })

            let selectedItems: ShopItemFilterData[] = []

            if (featuredItems.length >= 6) {
                // Use 6 featured items, sorted by updatedAt
                selectedItems = featuredItems
                    .sort((a, b) => {
                        const dateA = typeof a.updatedAt === 'string' ? new Date(a.updatedAt).getTime() : new Date(a.updatedAt).getTime()
                        const dateB = typeof b.updatedAt === 'string' ? new Date(b.updatedAt).getTime() : new Date(b.updatedAt).getTime()
                        return dateB - dateA
                    })
                    .slice(0, 6)
            } else {
                // Use featured items + latest updated items to fill up to 6
                selectedItems = [...featuredItems]
                const remainingSlots = 6 - featuredItems.length
                const nonFeaturedItems = sortedAllItems.filter((item) => !item.isFeatured)
                selectedItems.push(...nonFeaturedItems.slice(0, remainingSlots))
            }

            if (selectedItems.length > 0) {
                const statusSortedItems = [...selectedItems].sort(
                    (a, b) =>
                        Number(b.isFeatured) - Number(a.isFeatured) ||
                        STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]
                )
                result.push({ shop, items: statusSortedItems })
            }
        })

        return result
    }, [publishedShops, selectedShopType, selectedType, selectedTag, selectedStatus])

    // When switching between shops, reset item filters so each shop starts "clean"
    useEffect(() => {
        setSelectedType('')
        setSelectedTag('')
        setSelectedStatus('')
    }, [selectedShopId])

    // Clear selected item when item filters change so the detail view stays in sync,
    // but do NOT clear it just because the selected shop changes (so clicking an
    // item from the Home/all-shops view both selects the shop and keeps that item open).
    useEffect(() => {
        setSelectedItem(null)
    }, [selectedType, selectedTag, selectedStatus])

    const headerBackgroundImage =
        selectedShop?.imageUrl?.trim() || DEFAULT_SHOP_HEADER_IMAGE

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Sidebar - Shops grouped by type */}
            <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block md:w-[180px] lg:w-[220px] xl:w-[240px]">
                <div className="p-4">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                        {t('shops')}
                    </h2>
                    <div className="mb-6">
                        <Select value={selectedShopType || 'all'} onValueChange={(value) => setSelectedShopType(value === 'all' ? '' : value)}>
                            <SelectTrigger className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700">
                                <SelectValue placeholder="Filter by Shop Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all-shop-types')}</SelectItem>
                                {SHOP_TYPE_OPTIONS.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {t(type)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-6">
                        {SHOP_TYPE_OPTIONS.map((shopType) => {
                            const shopsInType = shopsGroupedByType[shopType]
                            if (shopsInType.length === 0) return null

                            return (
                                <div key={shopType} className="space-y-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {t(shopType)}
                                    </h3>
                                    <div className="space-y-1">
                                        {shopsInType.map((shop) => {
                                            const isActive = shop.id === selectedShopId
                                            return (
                                                <button
                                                    key={shop.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedShopId(shop.id)
                                                        // When manually switching shops from the sidebar,
                                                        // clear any previously selected item.
                                                        setSelectedItem(null)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${isActive
                                                        ? 'bg-bgColor-brand900 text-white font-medium'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{shop.title}</span>
                                                        <span
                                                            className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'
                                                                }`}
                                                        >
                                                            {shop.shopItems.length}
                                                        </span>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </aside>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <header className="relative overflow-hidden px-6 py-8 text-color-white bg-[#1F2937]">
                    <div className="absolute inset-y-0 right-0 z-0 w-full max-w-[30%] lg:max-w-[23%] flex items-start justify-end gap-4 pr-4">
                        <button
                            type="button"
                            onClick={() => setIsCartSheetOpen(true)}
                            className="relative mt-1 flex h-10 w-10 items-center justify-center rounded-full text-textColor-secondary100"
                        >
                            <ShoppingBag className="h-6 w-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-1 right-0 rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                        <div className="relative h-full w-full pointer-events-none">
                            <Image
                                src={headerBackgroundImage}
                                alt={selectedShop?.title ?? 'Shop header background'}
                                fill
                                sizes="(min-width: 1024px) 33vw, 50vw"
                                className="object-fill object-right opacity-40"
                            />
                        </div>
                    </div>

                    <div className="relative z-20 flex flex-col gap-2">
                        <h1 className="flex-1 text-center text-4xl font-bold text-textColor-white">
                            {selectedShop?.title ?? t('all-shops')}
                        </h1>
                        
                        {/* Breadcrumb Navigation */}
                        <div className="flex items-center gap-2 text-textColor-white">
                            <button
                                type="button"
                                onClick={() => setSelectedShopId('')}
                                className="hover:text-textColor-white/80 transition-colors hover:underline"
                            >
                                Home
                            </button>
                            {selectedShop && (
                                <>
                                    <ChevronRight className="h-4 w-4" />
                                    <span>{selectedShop.title}</span>
                                </>
                            )}
                        </div>
                        
                        {/* Shop and Shop Type Selectors (for sm view only ) */}

                        {/* Item Filters Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 text-sm 2xl:text-base">
                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={selectedType || 'all'} onValueChange={(value) => setSelectedType(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-11 w-auto rounded-xl border border-white/20 bg-white/5 px-4 text-textColor-white p-2 2xl:px-4">
                                        <SelectValue placeholder={t('item-type')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <span className="xl:hidden">{t('item-type')}</span>
                                            <span className="hidden xl:inline">{t('item-type-all')}</span>
                                        </SelectItem>
                                        {allTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {t(type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedTag || 'all'} onValueChange={(value) => setSelectedTag(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-11 w-auto rounded-xl border border-white/20 bg-white/5 px-4 text-textColor-white p-2 2xl:px-4">
                                        <SelectValue placeholder={t('tags')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <span className="xl:hidden">{t('tags')}</span>
                                            <span className="hidden xl:inline">{t('tags-all')}</span>
                                        </SelectItem>
                                        {allTags.map((tag) => (
                                            <SelectItem key={tag} value={tag}>
                                                {tag}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedStatus || 'all'} onValueChange={(value) => setSelectedStatus(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-11 w-auto rounded-xl border border-white/20 bg-white/5 px-4 text-textColor-white p-2 2xl:px-4">
                                        <SelectValue placeholder={t('item-status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <span className="xl:hidden">{t('item-status')}</span>
                                            <span className="hidden xl:inline">{t('item-status-all')}</span>
                                        </SelectItem>
                                        {allStatuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {t(ITEM_STATUS_LABELS[status])}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-11 gap-2 text-textColor-white/80 hover:bg-white/10 hover:text-textColor-white px-2"
                                    onClick={() => {
                                        setSelectedType('')
                                        setSelectedTag('')
                                        setSelectedStatus('')
                                    }}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="text-textColor-white/80">
                                    {t('showing')} <span className="font-bold text-textColor-white">{sortedItems.length}</span>{' '}
                                    {t('products')}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-textColor-white/80">{t('sort-by')}:</span>
                                    <Select value={selectedSort} onValueChange={(value) => setSelectedSort(value as (typeof SORT_OPTIONS)[number]['value'])}>
                                        <SelectTrigger className="h-11 w-auto rounded-xl border border-white/20 bg-white/5 px-4 text-textColor-white p-2 2xl:px-4">
                                            <SelectValue placeholder={t('featured')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SORT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {t(option.label)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Product Grid */}
                {selectedShop ? (
                    <div className="flex-1 p-6">
                        {sortedItems.length > 0 ? (
                            <>
                                {/* Selected item detail view */}
                                {selectedItem && (
                                    <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row">
                                        {/* Left: Image */}
                                        <div className="w-full md:w-1/2">
                                            {/* Main image with tag overlays */}
                                            {(() => {
                                                const displayUrl = activeImageUrl ?? selectedItem.imageUrl
                                                return (
                                                    <div
                                                        className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-md bg-gray-100 transition-transform hover:scale-[1.01]"
                                                        onClick={() => { if (displayUrl) openImageModal(displayUrl) }}
                                                    >
                                                        {displayUrl ? (
                                                            <Image
                                                                src={displayUrl}
                                                                alt={selectedItem.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                                No Image
                                                            </div>
                                                        )}

                                                        {/* Tags overlay — top-left corner */}
                                                        {selectedItem.tags.length > 0 && (
                                                            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                                                {selectedItem.tags.map((tag, idx) => (
                                                                    <Badge
                                                                        key={`${selectedItem.id}-tag-${idx}`}
                                                                        className="text-[10px] bg-black/60 text-white border-0 backdrop-blur-sm"
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Hover magnifier overlay */}
                                                        {displayUrl && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-10">
                                                                <div className="rounded-full bg-white bg-opacity-90 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                    <Search className="h-5 w-5 text-gray-700" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })()}

                                            {/* Thumbnail strip */}
                                            {selectedItem.images && selectedItem.images.length > 0 && (
                                                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                                    {/* Main image as first thumbnail */}
                                                    {selectedItem.imageUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveImageUrl(null)}
                                                            className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${activeImageUrl === null
                                                                    ? 'border-blue-500'
                                                                    : 'border-transparent hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <Image
                                                                src={selectedItem.imageUrl}
                                                                alt="Main image"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </button>
                                                    )}
                                                    {selectedItem.images.map((imgUrl, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setActiveImageUrl(imgUrl)}
                                                            className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${activeImageUrl === imgUrl
                                                                    ? 'border-blue-500'
                                                                    : 'border-transparent hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <Image
                                                                src={imgUrl}
                                                                alt={`Image ${idx + 1}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: Info */}
                                        <div className="w-full space-y-3 md:w-1/2">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedItem.title}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                {t(selectedItem.type)} • {t(ITEM_STATUS_LABELS[selectedItem.status])}
                                            </p>
                                            <p className="text-xl font-semibold text-gray-900">
                                                {typeof selectedItem.price === 'string'
                                                    ? `$${parseFloat(selectedItem.price).toFixed(2)} ${selectedItem.currency}`
                                                    : `$${selectedItem.price.toFixed(2)} ${selectedItem.currency}`}
                                            </p>
                                            {selectedItem.discountMemberPercent != null &&
                                                selectedItem.discountMemberPercent > 0 && (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-bgColor-secondary400 bg-bgColor-secondary50 px-2 py-0.5 text-xs font-medium text-amber-700 w-fit">
                                                        ✦ {t('member-price')}:{' '}
                                                        {(() => {
                                                            const numericPrice =
                                                                typeof selectedItem.price === 'string'
                                                                    ? parseFloat(selectedItem.price)
                                                                    : selectedItem.price
                                                            const safePrice = Number.isNaN(numericPrice)
                                                                ? 0
                                                                : numericPrice
                                                            const discounted =
                                                                safePrice *
                                                                (1 -
                                                                    selectedItem.discountMemberPercent! /
                                                                    100)

                                                            return `$${discounted.toFixed(2)} ${selectedItem.currency} (${selectedItem.discountMemberPercent}% off)`
                                                        })()}
                                                    </span>
                                                )}

                                            {selectedItem.description && (
                                                <div className="max-w-none text-sm text-gray-700">
                                                    <TextPreview value={selectedItem.description || ''} />
                                                </div>
                                            )}

                                            <div>
                                                <Button
                                                    className="bg-bgColor-brand900 text-white hover:bg-bgColor-brand600"
                                                    onClick={() => selectedItem && handleAddItemToCart(selectedItem, selectedShopId, selectedShop?.title ?? '')}
                                                >
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    {t('add-to-cart')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Product cards grid */}
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {sortedItems.map((item) => {
                                        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                                        const formattedPrice = isNaN(price) ? '0.00' : price.toFixed(2)

                                        return (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md cursor-pointer transition-transform duration-200 hover:scale-105"
                                                onClick={() => { setSelectedItem(item); setActiveImageUrl(null) }}
                                            >
                                                {/* Image Container */}
                                                <div className="relative w-full h-48 bg-gray-100">
                                                    {item.imageUrl ? (
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}

                                                    {/* Tags in top left */}
                                                    {item.tags.length > 0 && (
                                                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                                            {item.tags.slice(0, 2).map((tag, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="secondary"
                                                                    className="text-xs bg-white/90 text-gray-700"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 space-y-2">
                                                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem]">
                                                        {item.title}
                                                    </h3>

                                                    {/* Item Type under title */}
                                                    <p className="text-sm text-gray-500">
                                                        {t(ITEM_STATUS_LABELS[item.status])} • {t(item.type)}
                                                    </p>

                                                    {/* Price and Add Button */}
                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-base font-bold text-gray-900">
                                                            ${formattedPrice} {item.currency}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            className="bg-bgColor-brand900 hover:bg-bgColor-brand600 text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleAddItemToCart(item, selectedShopId, selectedShop?.title ?? '')
                                                            }}
                                                        >
                                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                                            {t('add')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500">No items found</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // All Shops View
                    <div className="flex-1 p-6">
                        {featuredItemsByShop.length > 0 ? (
                            <div className="space-y-8">
                                {featuredItemsByShop.map(({ shop, items }) => (
                                    <div key={shop.id} className="space-y-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedShopId(shop.id)}
                                            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-bgColor-brand900 transition-colors"
                                        >
                                            <span>{shop.title}</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                        <ShopItemCarousel
                                            items={items}
                                            onItemClick={(item) => {
                                                setSelectedShopId(shop.id)
                                                setSelectedItem(item)
                                                setActiveImageUrl(null)
                                            }}
                                            onAddToCart={(item) => {
                                                setSelectedShopId(shop.id)
                                                setSelectedItem(item)
                                                setActiveImageUrl(null)
                                                handleAddItemToCart(item, shop.id, shop.title)
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <p className="text-gray-500 text-lg">No products available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Sheet open={isCartSheetOpen} onOpenChange={handleCartSheetOpenChange}>
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto bg-white text-gray-900 md:min-w-[400px] lg:min-w-[480px]"
                >
                    <SheetHeader>
                        <SheetTitle>{t('selected-items')}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        {cartItems.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                {t('no-items-selected')}
                            </p>
                        ) : /* ── Specific-shop view: always show checkout directly ── */
                            selectedShopId ? (
                                checkoutItems.length === 0 ? (
                                    <p className="text-sm text-red-600">
                                        These items are not yet configured for online checkout.
                                    </p>
                                ) : (
                                    <ShoppingSheetCheckout
                                        shopSlug={activeCheckoutShop?.slug ?? activeCheckoutShop?.id ?? ''}
                                        shopId={activeCheckoutShop?.id ?? ''}
                                        selectedShopItems={checkoutItems}
                                        onClearCart={() => setCartItems([])}
                                        onRemoveItem={handleRemoveCartItem}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        userInfo={userInfo}
                                        isSubscribed={isSubscribed}
                                        discounts={activeCheckoutShop?.shopDiscounts ?? []}
                                    />
                                )
                            ) : /* ── All-shops view ── */
                                activeShopIdInSheet ? (
                                    /* Per-shop checkout */
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setActiveShopIdInSheet(null)}
                                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            {t('back-to-cart')}
                                        </button>
                                        {checkoutItems.length === 0 ? (
                                            <p className="text-sm text-red-600">
                                                These items are not yet configured for online checkout.
                                            </p>
                                        ) : (
                                            <ShoppingSheetCheckout
                                                shopSlug={activeCheckoutShop?.slug ?? activeCheckoutShop?.id ?? ''}
                                                shopId={activeCheckoutShop?.id ?? ''}
                                                selectedShopItems={checkoutItems}
                                                onClearCart={() => setCartItems([])}
                                                onRemoveItem={handleRemoveCartItem}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                userInfo={userInfo}
                                                isSubscribed={isSubscribed}
                                                discounts={activeCheckoutShop?.shopDiscounts ?? []}
                                            />
                                        )}
                                    </>
                                ) : (
                                    /* Per-shop preview list */
                                    <div className="space-y-4">
                                        {cartItemsByShop.map(({ shopId, shopTitle, items: shopCartItems }) => {
                                            const previewItems = shopCartItems.slice(0, 3)
                                            const leftover = shopCartItems.length - 3
                                            const totalQty = shopCartItems.reduce((sum, ci) => sum + ci.quantity, 0)
                                            return (
                                                <div key={shopId} className="rounded-lg border border-gray-200 p-4 space-y-3">
                                                    {/* Shop name + item count */}
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-gray-900">{shopTitle}</h4>
                                                        <span className="text-xs text-gray-500">{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
                                                    </div>

                                                    {/* Thumbnail strip */}
                                                    <div className="flex items-center gap-2">
                                                        {previewItems.map((ci) => (
                                                            <div
                                                                key={ci.item.id}
                                                                className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100"
                                                            >
                                                                {ci.item.imageUrl ? (
                                                                    <Image
                                                                        src={ci.item.imageUrl}
                                                                        alt={ci.item.title}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="64px"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                                                                        No Image
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {leftover > 0 && (
                                                            <span className="text-sm font-semibold text-gray-600">
                                                                +{leftover}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Continue Shopping button */}
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-bgColor-brand900 hover:bg-bgColor-brand600 text-white"
                                                        onClick={() => setActiveShopIdInSheet(shopId)}
                                                    >
                                                        {t('continue-shopping')}
                                                        <ArrowRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Image lightbox modal */}
            {modalImageUrl && (
                <div
                    className="fixed inset-0 z-[90] m-0 flex items-center justify-center bg-black/80 p-0 [margin-top:0!important]"
                    onClick={handleModalOverlayClick}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg">
                        <Image
                            src={modalImageUrl}
                            alt="Full size image"
                            width={800}
                            height={600}
                            className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain"
                            sizes="90vw"
                        />
                        <button
                            onClick={closeImageModal}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white bg-opacity-80 text-gray-800 transition-all duration-200 hover:bg-opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
