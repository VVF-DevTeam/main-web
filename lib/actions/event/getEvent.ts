'use server'

import { Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'

// Cached version of getAllPublishedEvents with revalidateTag support
// Default: returns minimal fields (id, title) for backward compatibility
export const getAllPublishedEvents = unstable_cache(
  async (selectFields?: Prisma.EventSelect) => {
    const { prisma } = await import('@/lib/db')
    try {
      // If selectFields provided, use select; otherwise default to id and title
      const events = await prisma.event.findMany({
        where: {
          isPublished: true,
        },
        select: selectFields || {
          id: true,
          title: true,
        },
      })
      return events
    } catch (error) {
      console.error('Error getting published events:', error)
      return []
    }
  },
  ['events-published-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)

// Cached version to get all published events with relations (categories, tickets)
export const getAllPublishedEventsWithRelations = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    try {
      const events = await prisma.event.findMany({
        where: {
          isPublished: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          categories: true,
          tickets: true,
        },
      })
      return events
    } catch (error) {
      console.error('Error getting published events:', error)
      return []
    }
  },
  ['events-published-with-relations'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)

// Cached version with revalidateTag support
export const getPublishedEventsWithFilters = unstable_cache(
  async ({
    numberOfEvents,
    upcoming,
    finished,
    orderByField,
    orderDirection,
    includeCategories,
    selectFields,
  }: {
    numberOfEvents: number
    upcoming: boolean
    finished: boolean
    orderByField?: string
    orderDirection?: 'asc' | 'desc'
    includeCategories?: boolean
    selectFields?: Prisma.EventSelect
  }) => {
    const { prisma } = await import('@/lib/db')
    try {
      const baseQuery = {
        where: {
          isPublished: true,
          ...(upcoming && {
            endDate: {
              gte: new Date(),
            },
          }),
          ...(finished && {
            endDate: {
              lt: new Date(),
            },
          }),
        },
        orderBy: {
          [orderByField || 'createdAt']: orderDirection || 'desc',
        },
        take: numberOfEvents ? numberOfEvents : undefined,
      }

      const events = selectFields
        ? await prisma.event.findMany({
            ...baseQuery,
            select: {
              ...selectFields,
              categories: includeCategories ? true : false,
            },
          })
        : await prisma.event.findMany({
            ...baseQuery,
            include: {
              categories: includeCategories ? true : false,
              tickets: true,
            },
          })

      return events
    } catch (error) {
      console.error('Error getting published events:', error)
      return []
    }
  },
  ['events-published-filtered'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)

export async function getEventsOfHost(userId: string) {
  const { prisma } = await import('@/lib/db')
  try {
    const hosts = await prisma.event.findMany({
      where: {
        hosts: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
      },
    })
    return hosts
  } catch (error) {
    console.error('Error getting events of host:', error)
    return []
  }
}
