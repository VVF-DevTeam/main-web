'use server'

import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Get all shops (published and unpublished) - for admin use only
// Cached with revalidateTag support - cache is invalidated when shops are created/updated/deleted
export const getAllShops = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.shop.findMany({
          orderBy: {
            updatedAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            type: true,
            isPublished: true,
            sortOrder: true,
            updatedAt: true,
            termsAndConditions: true,
            shopDiscounts: true,
            event: {
              select: {
                title: true,
              },
            },
            shopItems: {
              select: {
                id: true,
                title: true,
                type: true,
                tags: true,
                status: true,
                isFeatured: true,
                imageUrl: true,
                images: true,
                price: true,
                currency: true,
                description: true,
                updatedAt: true,
                stripePriceId: true,
                stripeProductId: true,
                subscribedStripePriceId: true,
                discountMemberPercent: true,
              },
              orderBy: {
                updatedAt: 'desc',
              },
            },
          },
        }),
      { label: 'getAllShops' }
    )
  },
  ['shops-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['shops'], // Tag for revalidation
  }
)

// Cached version of getAllPublishedShops with revalidateTag support
// Default: returns minimal fields (id, title) for backward compatibility
export const getAllPublishedShops = unstable_cache(
  async (selectFields?: Prisma.ShopSelect) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.shop.findMany({
          where: {
            isPublished: true,
          },
          select: selectFields || {
            id: true,
            title: true,
          },
        }),
      { label: 'getAllPublishedShops' }
    )
  },
  ['shops-published-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['shops'], // Tag for revalidation
  }
)

// Alias used by ShopStatistics for naming consistency
export const getAllPublishedShop = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.shop.findMany({
          where: {
            isPublished: true,
          },
          select: {
            id: true,
            title: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        }),
      { label: 'getAllPublishedShop' }
    )
  },
  ['shops-published-list-v1'],
  {
    revalidate: 604800,
    tags: ['shops'],
  }
)

export async function getShopsOfShopOwner(ownerId: string) {
  const cachedFunction = unstable_cache(
    async () => {
      const { prisma } = await import('@/lib/db')
      return withDbRetry(
        () =>
          prisma.shop.findMany({
            where: {
              ownerId,
            },
            orderBy: {
              updatedAt: 'desc',
            },
          }),
        { label: 'getShopsOfShopOwner' }
      )
    },
    [`shops-by-owner-v2-${ownerId}`],
    {
      revalidate: 604800,
      tags: ['shops'],
    }
  )

  return await cachedFunction()
}

// Get shop by ID
export const getShopById = unstable_cache(
  async (shopId: string) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.shop.findUnique({
          where: {
            id: shopId,
          },
          include: {
            shopItems: true,
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
      { label: 'getShopById' }
    )
  },
  ['shop-by-id'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days
    tags: ['shops'], // Tag for revalidation
  }
)

// Get shop by slug
export const getShopBySlug = unstable_cache(
  async (slug: string) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.shop.findUnique({
          where: {
            slug: slug,
          },
          include: {
            shopItems: true,
            event: true,
          },
        }),
      { label: 'getShopBySlug' }
    )
  },
  ['shop-by-slug'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days
    tags: ['shops'], // Tag for revalidation
  }
)

// Get shop by ID specifically for editing
// Includes all necessary relations for the edit shop form
export const getShopForEditing = unstable_cache(
  async (shopId: string) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.shop.findUnique({
          where: {
            id: shopId,
          },
          include: {
            shopItems: {
              include: {
                tags: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
            event: {
              select: {
                id: true,
                title: true,
                keyName: true,
              },
            },
          },
        }),
      { label: 'getShopForEditing' }
    )
  },
  ['shop-for-editing'], // Cache key prefix
  {
    revalidate: 86400, // Cache for 1 day (shorter since this is for editing)
    tags: ['shops'], // Tag for revalidation
  }
)
