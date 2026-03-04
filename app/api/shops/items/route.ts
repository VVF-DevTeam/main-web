import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidateTag } from 'next/cache'

// Create a ShopItem
export const POST = async (request: Request) => {
    try {
        const {
            shopIds,
            title,
            description,
            sku,
            type,
            imageUrl,
            images,
            limit,
            stockCount,
            lowStockThreshold,
            trackInventory,
            price,
            currency,
            discountMemberPercent,
            taxPercent,
            minQuantity,
            maxQuantity,
            status,
            validFrom,
            validTo,
            isFeatured,
            sortOrder,
            existingTagIds,
            newTagTitles,
            stripeProductId,
            stripePriceId,
            subscribedStripePriceId,
        } = await request.json()

        if (!shopIds || !Array.isArray(shopIds) || shopIds.length === 0) {
            return new NextResponse('At least one shop ID is required', { status: 400 })
        }

        // Ensure the related shops exist
        const shops = await prisma.shop.findMany({
            where: { id: { in: shopIds } },
        })
        if (shops.length !== shopIds.length) {
            return new NextResponse('One or more shops not found', { status: 404 })
        }

        const item = await prisma.shopItem.create({
            data: {
                title,
                description: description || null,
                sku: sku || null,
                type,
                imageUrl: imageUrl || null,
                images: images || [],
                limit: limit !== undefined && limit !== null ? Math.round(Number(limit)) : null,
                stockCount:
                    trackInventory && stockCount !== undefined && stockCount !== null
                        ? Math.round(Number(stockCount))
                        : null,
                lowStockThreshold:
                    trackInventory && lowStockThreshold !== undefined && lowStockThreshold !== null
                        ? Math.round(Number(lowStockThreshold))
                        : null,
                trackInventory: trackInventory || false,
                price,
                currency: currency || 'CAD',
                discountMemberPercent:
                    discountMemberPercent !== undefined && discountMemberPercent !== null
                        ? Math.round(Number(discountMemberPercent))
                        : null,
                taxPercent:
                    taxPercent !== undefined && taxPercent !== null
                        ? Math.round(Number(taxPercent))
                        : null,
                minQuantity:
                    minQuantity !== undefined && minQuantity !== null
                        ? Math.round(Number(minQuantity))
                        : null,
                maxQuantity:
                    maxQuantity !== undefined && maxQuantity !== null
                        ? Math.round(Number(maxQuantity))
                        : null,
                status: status || 'AVAILABLE',
                validFrom: validFrom ? new Date(validFrom) : null,
                validTo: validTo ? new Date(validTo) : null,
                isFeatured: isFeatured || false,
                sortOrder:
                    sortOrder !== undefined && sortOrder !== null
                        ? Math.round(Number(sortOrder))
                        : null,
                // Tags: connect existing tags by id and/or create new tags by title
                ...(Array.isArray(existingTagIds) || Array.isArray(newTagTitles)
                    ? {
                        tags: {
                            ...(Array.isArray(existingTagIds) && existingTagIds.length > 0
                                ? {
                                    connect: existingTagIds.map((id: string) => ({ id })),
                                }
                                : {}),
                            ...(Array.isArray(newTagTitles) && newTagTitles.length > 0
                                ? {
                                    create: newTagTitles
                                        .filter((title: string) => title.trim() !== '')
                                        .map((title: string) => ({ title })),
                                }
                                : {}),
                        },
                    }
                    : {}),
                stripeProductId: stripeProductId,
                stripePriceId: stripePriceId,
                subscribedStripePriceId: subscribedStripePriceId,
                shops: {
                    connect: shopIds.map((shopId: string) => ({ id: shopId })),
                },
            },
        })

        // Revalidate shops cache
        revalidateTag('shops')

        return NextResponse.json(item)
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Duplicate unique field
                return new NextResponse(
                    'Duplicate shop item data violates a unique constraint (e.g., SKU already exists).',
                    {
                        status: 409,
                    }
                )
            }
        }

        if (error instanceof Error) {
            console.log('[CREATE SHOP ITEM ERROR]: ', error.stack)
        } else {
            console.log('[CREATE SHOP ITEM ERROR]: ', error)
        }
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

// Update a ShopItem
export const PUT = async (request: Request) => {
    try {
        const {
            id, // ShopItem id (required for update)
            shopIds,
            ...values
        } = await request.json()

        if (!id) {
            return new NextResponse('Item id is required', { status: 400 })
        }

        const existing = await prisma.shopItem.findUnique({
            where: { id },
            include: { shops: true },
        })
        if (!existing) {
            return new NextResponse('Shop item not found', { status: 404 })
        }

        const {
            validFrom,
            validTo,
            currency,
            limit,
            stockCount,
            lowStockThreshold,
            discountMemberPercent,
            subscribedStripePriceId,
            price,
            imageUrl,
            images,
            existingTagIds,
            newTagTitles,
            minQuantity,
            maxQuantity,
            sortOrder,
            taxPercent,
            ...rest
        } = values as {
            validFrom?: string | Date | null
            validTo?: string | Date | null
            currency?: string
            limit?: number | null
            stockCount?: number | null
            lowStockThreshold?: number | null
            discountMemberPercent?: number | null
            subscribedStripePriceId?: string | null
            price?: number
            imageUrl?: string | null
            images?: string[]
            existingTagIds?: string[]
            newTagTitles?: string[]
            minQuantity?: number | null
            maxQuantity?: number | null
            sortOrder?: number | null
            taxPercent?: number | null
            [key: string]: unknown
        }

        // Backward safety: ignore old field if any client still sends it
        if ('taxable' in rest) {
            delete (rest as Record<string, unknown>).taxable
        }

        // Handle shopIds update (many-to-many relation)
        const shopIdsUpdate = shopIds
            ? {
                shops: {
                    set: shopIds.map((shopId: string) => ({ id: shopId })),
                },
            }
            : {}

        const updated = await prisma.shopItem.update({
            where: { id },
            data: {
                ...rest,
                ...shopIdsUpdate,
                ...(price !== undefined && { price: price }),
                currency: currency ?? existing.currency,
                limit:
                    limit !== undefined
                        ? limit !== null
                            ? Math.round(Number(limit))
                            : null
                        : existing.limit,
                stockCount:
                    stockCount !== undefined
                        ? stockCount !== null
                            ? Math.round(Number(stockCount))
                            : null
                        : existing.stockCount,
                lowStockThreshold:
                    lowStockThreshold !== undefined
                        ? lowStockThreshold !== null
                            ? Math.round(Number(lowStockThreshold))
                            : null
                        : existing.lowStockThreshold,
                discountMemberPercent:
                    discountMemberPercent !== undefined
                        ? discountMemberPercent !== null
                            ? Math.round(Number(discountMemberPercent))
                            : null
                        : existing.discountMemberPercent,
                subscribedStripePriceId:
                    subscribedStripePriceId !== undefined
                        ? subscribedStripePriceId ?? null
                        : existing.subscribedStripePriceId,
                imageUrl:
                    imageUrl !== undefined ? imageUrl ?? null : existing.imageUrl,
                images: images !== undefined ? images : existing.images,
                // Update tag relations when explicit tag data is provided
                ...((existingTagIds !== undefined || newTagTitles !== undefined) && {
                    tags:
                        {
                            // Set to provided existing ids (or clear if none) and create new titles
                            set:
                                existingTagIds && existingTagIds.length > 0
                                    ? existingTagIds.map((id) => ({ id }))
                                    : [],
                            ...(newTagTitles && newTagTitles.length > 0
                                ? {
                                    create: newTagTitles
                                        .filter((title) => title.trim() !== '')
                                        .map((title) => ({ title })),
                                }
                                : {}),
                        },
                }),
                minQuantity:
                    minQuantity !== undefined
                        ? minQuantity !== null
                            ? Math.round(Number(minQuantity))
                            : null
                        : existing.minQuantity,
                maxQuantity:
                    maxQuantity !== undefined
                        ? maxQuantity !== null
                            ? Math.round(Number(maxQuantity))
                            : null
                        : existing.maxQuantity,
                sortOrder:
                    sortOrder !== undefined
                        ? sortOrder !== null
                            ? Math.round(Number(sortOrder))
                            : null
                        : existing.sortOrder,
                taxPercent:
                    taxPercent !== undefined
                        ? taxPercent !== null
                            ? Math.round(Number(taxPercent))
                            : null
                        : existing.taxPercent,
                validFrom: validFrom
                    ? new Date(validFrom)
                    : validFrom === null
                        ? null
                        : existing.validFrom,
                validTo: validTo
                    ? new Date(validTo)
                    : validTo === null
                        ? null
                        : existing.validTo,
            },
        })

        // Revalidate shops cache
        revalidateTag('shops')

        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // Duplicate unique field
                return new NextResponse(
                    'Duplicate shop item data violates a unique constraint (e.g., SKU already exists).',
                    {
                        status: 409,
                    }
                )
            }
        }

        if (error instanceof Error) {
            console.log('[UPDATE SHOP ITEM ERROR]: ', error.stack)
        } else {
            console.log('[UPDATE SHOP ITEM ERROR]: ', error)
        }
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

// Delete a ShopItem
export const DELETE = async (request: Request) => {
    try {
        const { id } = await request.json()

        if (!id) {
            return new NextResponse('Item id is required', { status: 400 })
        }

        const existing = await prisma.shopItem.findUnique({
            where: { id },
        })
        if (!existing) {
            return new NextResponse('Shop item not found', { status: 404 })
        }

        await prisma.shopItem.delete({
            where: { id },
        })

        // Revalidate shops cache
        revalidateTag('shops')

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                // Foreign key constraint violation
                return new NextResponse(
                    'Cannot delete shop item with existing relations.',
                    {
                        status: 409,
                    }
                )
            }
        }

        if (error instanceof Error) {
            console.log('[DELETE SHOP ITEM ERROR]: ', error.stack)
        } else {
            console.log('[DELETE SHOP ITEM ERROR]: ', error)
        }
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

