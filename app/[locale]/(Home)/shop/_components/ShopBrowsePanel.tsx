'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { ChevronRight, RotateCcw, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type ShopItemFilterData = {
    id: string
    title: string
    type: 'General' | 'Limit' | 'Discount'
    tags: string[]
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'COMING_SOON'
    isFeatured: boolean
    imageUrl?: string | null
    price: number | string
    currency: string
    description?: string | null
    updatedAt: Date | string
}

type ShopType = 'General' | 'Food' | 'Clothes' | 'Event' | 'Fundraiser' | 'Digital' | 'Seasonal'

type ShopWithItems = {
    id: string
    title: string
    imageUrl?: string | null
    type: ShopType
    shopItems: ShopItemFilterData[]
    event?: {
        title: string
    } | null
}

interface ShopBrowsePanelProps {
    shops: ShopWithItems[]
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
    'https://drive.google.com/thumbnail?id=1MPonA6byLm1rQUOhDHT7dJNoaH3tDQ9S'

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
function ShopItemCarousel({ items }: { items: ShopItemFilterData[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Calculate items per view based on screen size
    const getItemsPerView = useCallback(() => {
        if (typeof window === 'undefined') return 1
        const width = window.innerWidth
        if (width >= 1280) return 4 // xl
        if (width >= 1024) return 3 // lg
        if (width >= 768) return 2 // md
        return 1 // sm (default)
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
                            className="flex-shrink-0 px-3"
                            style={{ width: `${itemWidthPercent}%` }}
                        >
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
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
                                        {item.type}
                                    </p>

                                    {/* Price and Add Button */}
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xl font-bold text-gray-900">
                                            ${formattedPrice} {item.currency}
                                        </span>
                                        <Button
                                            size="sm"
                                            className="bg-bgColor-brand900 hover:bg-bgColor-brand600 text-white"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Add
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

export default function ShopBrowsePanel({ shops }: ShopBrowsePanelProps) {
    const [selectedShopId, setSelectedShopId] = useState<string>('')
    const [selectedShopType, setSelectedShopType] = useState<string>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [selectedTag, setSelectedTag] = useState<string>('')
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [selectedSort, setSelectedSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('featured')

    const selectedShop = useMemo(
        () => shops.find((shop) => shop.id === selectedShopId) ?? null,
        [shops, selectedShopId]
    )

    const shopsGroupedByType = useMemo(() => {
        const filteredShops = selectedShopType
            ? shops.filter((shop) => shop.type === selectedShopType)
            : shops

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
    }, [shops, selectedShopType])

    const allTypes = useMemo(
        () => SHOP_ITEM_TYPE_OPTIONS,
        []
    )

    const allTags = useMemo(() => {
        if (selectedShopId) {
            // Only show tags from the selected shop's items
            const selectedShop = shops.find((shop) => shop.id === selectedShopId)
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
                shops.flatMap((shop) =>
                    shop.shopItems.flatMap((item) => item.tags.filter((tag) => tag.trim() !== ''))
                )
            )
        )
    }, [shops, selectedShopId])

    const allStatuses = useMemo(
        () => ITEM_STATUS_OPTIONS,
        []
    )

    const filteredItems = useMemo(
        () =>
            getAllFilteredItems(
                shops,
                selectedShopId,
                selectedType,
                selectedTag,
                selectedStatus
            ),
        [shops, selectedShopId, selectedType, selectedTag, selectedStatus]
    )

    const sortedItems = useMemo(() => {
        const cloned = [...filteredItems]
        if (selectedSort === 'title-asc') {
            return cloned.sort((a, b) => a.title.localeCompare(b.title))
        }
        if (selectedSort === 'title-desc') {
            return cloned.sort((a, b) => b.title.localeCompare(a.title))
        }
        return cloned.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    }, [filteredItems, selectedSort])

    // Get up to 6 featured items per shop (or latest updated if not enough featured)
    // Also applies item filters (type, tag, status) when no shop is selected
    const featuredItemsByShop = useMemo(() => {
        const result: Array<{ shop: ShopWithItems; items: ShopItemFilterData[] }> = []

        shops.forEach((shop) => {
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
                result.push({ shop, items: selectedItems })
            }
        })

        return result
    }, [shops, selectedShopType, selectedType, selectedTag, selectedStatus])

    const headerBackgroundImage =
        selectedShop?.imageUrl?.trim() || DEFAULT_SHOP_HEADER_IMAGE

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Sidebar - Shops grouped by type */}
            <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                        Shops
                    </h2>
                    <div className="mb-6">
                        <Select value={selectedShopType || 'all'} onValueChange={(value) => setSelectedShopType(value === 'all' ? '' : value)}>
                            <SelectTrigger className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700">
                                <SelectValue placeholder="Filter by Shop Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Shop Types</SelectItem>
                                {SHOP_TYPE_OPTIONS.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
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
                                        {shopType}
                                    </h3>
                                    <div className="space-y-1">
                                        {shopsInType.map((shop) => {
                                            const isActive = shop.id === selectedShopId
                                            return (
                                                <button
                                                    key={shop.id}
                                                    type="button"
                                                    onClick={() => setSelectedShopId(shop.id)}
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
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="relative overflow-hidden px-6 py-8 text-color-white bg-[#1F2937]">
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-full max-w-[50%] md:max-w-[40%]">
                        <Image
                            src={headerBackgroundImage}
                            alt={selectedShop?.title ?? 'Shop header background'}
                            fill
                            sizes="(min-width: 1024px) 33vw, 50vw"
                            className="object-fill object-right opacity-40"
                        />
                    </div>

                    <div className="relative z-20 flex flex-col gap-2">
                        <h1 className="flex-1 text-center text-4xl font-bold text-textColor-white">
                            {selectedShop?.title ?? 'All Shops'}
                        </h1>

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

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Select value={selectedType || 'all'} onValueChange={(value) => setSelectedType(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-11 w-[180px] rounded-xl border border-white/20 bg-white/5 px-4 text-base text-textColor-white">
                                        <SelectValue placeholder="Item Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Item Type (All)</SelectItem>
                                        {allTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedTag || 'all'} onValueChange={(value) => setSelectedTag(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-11 w-[160px] rounded-xl border border-white/20 bg-white/5 px-4 text-base text-textColor-white">
                                        <SelectValue placeholder="Tags" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tags (All)</SelectItem>
                                        {allTags.map((tag) => (
                                            <SelectItem key={tag} value={tag}>
                                                {tag}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedStatus || 'all'} onValueChange={(value) => setSelectedStatus(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="h-11 w-[180px] rounded-xl border border-white/20 bg-white/5 px-4 text-base text-textColor-white">
                                        <SelectValue placeholder="Item Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Item Status (All)</SelectItem>
                                        {allStatuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {ITEM_STATUS_LABELS[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-11 gap-2 text-base text-textColor-white/80 hover:bg-white/10 hover:text-textColor-white"
                                    onClick={() => {
                                        setSelectedType('')
                                        setSelectedTag('')
                                        setSelectedStatus('')
                                    }}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 text-lg">
                                <p className="text-textColor-white/80">
                                    Showing <span className="font-bold text-textColor-white">{sortedItems.length}</span>{' '}
                                    products
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-textColor-white/80">Sort by:</span>
                                    <Select value={selectedSort} onValueChange={(value) => setSelectedSort(value as (typeof SORT_OPTIONS)[number]['value'])}>
                                        <SelectTrigger className="h-11 w-[180px] rounded-xl border border-white/20 bg-white/5 px-4 text-base text-textColor-white">
                                            <SelectValue placeholder="Featured" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SORT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
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
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {sortedItems.map((item) => {
                                    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
                                    const formattedPrice = isNaN(price) ? '0.00' : price.toFixed(2)

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
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
                                                    {item.type}
                                                </p>

                                                {/* Price and Add Button */}
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-xl font-bold text-gray-900">
                                                        ${formattedPrice} {item.currency}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        className="bg-bgColor-brand900 hover:bg-bgColor-brand600 text-white"
                                                    >
                                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
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
                                        <ShopItemCarousel items={items} />
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
        </div>
    )
}
