"use client"

import React, { useState } from "react"
import { Search, ShoppingCart } from "lucide-react"
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import TextPreview from '@/components/quill/TextPreview'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShopItemFilterData, ITEM_STATUS_LABELS } from './ShopBrowsePanel'

interface ShopItemDetailedViewProps {
    item: ShopItemFilterData
    onClose: () => void
    onAddToCart: () => void
    onOpenImageModal: (url: string) => void
}

export default function ShopItemDetailedView({
    item,
    onClose,
    onAddToCart,
    onOpenImageModal,
}: ShopItemDetailedViewProps) {
    // @ts-ignore: useTranslation will always throw an error for typescript
    const { t } = useTranslation(['shop'])
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null)

    const displayUrl = activeImageUrl ?? item.imageUrl

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={handleOverlayClick}
        >
            <div
                className="relative mx-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{item.title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col gap-4 p-6 md:flex-row">
                    {/* Left: Image */}
                    <div className="w-full md:w-1/2 md:flex md:flex-col">
                        {/* Main image */}
                        <div
                            className="group relative aspect-[4/3] w-full flex-none cursor-pointer overflow-hidden rounded-md bg-gray-100 transition-transform hover:scale-[1.01]"
                            onClick={() => { if (displayUrl) onOpenImageModal(displayUrl) }}
                        >
                            {displayUrl ? (
                                <Image
                                    src={displayUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}

                            {/* Tags overlay */}
                            {item.tags.length > 0 && (
                                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                    {item.tags.map((tag, idx) => (
                                        <Badge
                                            key={`${item.id}-tag-${idx}`}
                                            className="text-[10px] bg-black/60 text-white border-0 backdrop-blur-sm"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Hover magnifier */}
                            {displayUrl && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-10">
                                    <div className="rounded-full bg-white bg-opacity-90 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                        <Search className="h-5 w-5 text-gray-700" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {item.images && (
                            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:flex-1 md:min-h-[70px] md:grid md:grid-cols-8 md:auto-rows-fr md:overflow-y-auto md:pb-0">
                                {item.imageUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveImageUrl(null)}
                                        className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-all md:h-full md:w-full ${activeImageUrl === null
                                            ? 'border-blue-500'
                                            : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <Image src={item.imageUrl} alt="Main image" fill className="object-cover" />
                                    </button>
                                )}
                                {item.images.map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImageUrl(imgUrl)}
                                        className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-all md:h-full md:w-full ${activeImageUrl === imgUrl
                                            ? 'border-blue-500'
                                            : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <Image src={imgUrl} alt={`Image ${idx + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="flex w-full flex-col space-y-3 md:w-1/2">
                        <p className="text-sm text-gray-500">
                            {t(item.type)} • {t(ITEM_STATUS_LABELS[item.status])}
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                            {typeof item.price === 'string'
                                ? `$${parseFloat(item.price).toFixed(2)} ${item.currency}`
                                : `$${item.price.toFixed(2)} ${item.currency}`}
                        </p>

                        {item.discountMemberPercent != null && item.discountMemberPercent > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-bgColor-secondary400 bg-bgColor-secondary50 px-2 py-0.5 text-xs font-medium text-amber-700 w-fit">
                                ✦ {t('member-price')}:{' '}
                                {(() => {
                                    const numericPrice =
                                        typeof item.price === 'string'
                                            ? parseFloat(item.price)
                                            : item.price
                                    const safePrice = Number.isNaN(numericPrice) ? 0 : numericPrice
                                    const discounted = safePrice * (1 - item.discountMemberPercent! / 100)
                                    return `$${discounted.toFixed(2)} ${item.currency} (${item.discountMemberPercent}% off)`
                                })()}
                            </span>
                        )}

                        {item.description && (
                            <div className="max-w-none text-sm text-gray-700">
                                <TextPreview value={item.description} />
                            </div>
                        )}

                        <div>
                            <Button
                                className="bg-bgColor-brand900 text-white hover:bg-bgColor-brand600"
                                onClick={onAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {t('add-to-cart')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
