'use server'

import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'

// Get all shops (published and unpublished) - for admin use only
// Cached with revalidateTag support - cache is invalidated when shops are created/updated/deleted
export const getAllShops = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    try {
      const shops = await prisma.shop.findMany({
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
              price: true,
              currency: true,
              description: true,
              updatedAt: true,
            },
            orderBy: {
              updatedAt: 'desc',
            },
          },
        },
      })
      return shops
    } catch (error) {
      console.error('Error getting all shops:', error)
      return []
    }
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
    try {
      // If selectFields provided, use select; otherwise default to id and title
      const shops = await prisma.shop.findMany({
        where: {
          isPublished: true,
        },
        select: selectFields || {
          id: true,
          title: true,
        },
      })
      return shops
    } catch (error) {
      console.error('Error getting published shops:', error)
      return []
    }
  },
  ['shops-published-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['shops'], // Tag for revalidation
  }
)

// Get shop by ID
export const getShopById = unstable_cache(
  async (shopId: string) => {
    const { prisma } = await import('@/lib/db')
    try {
      const shop = await prisma.shop.findUnique({
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
      })
      return shop
    } catch (error) {
      console.error('Error getting shop by ID:', error)
      return null
    }
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
    try {
      const shop = await prisma.shop.findUnique({
        where: {
          slug: slug,
        },
        include: {
          shopItems: true,
          event: true,
        },
      })
      return shop
    } catch (error) {
      console.error('Error getting shop by slug:', error)
      return null
    }
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
    try {
      return await prisma.shop.findUnique({
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
      })
    } catch (error) {
      console.error('Error getting shop for editing:', error)
      return null
    }
  },
  ['shop-for-editing'], // Cache key prefix
  {
    revalidate: 86400, // Cache for 1 day (shorter since this is for editing)
    tags: ['shops'], // Tag for revalidation
  }
)

