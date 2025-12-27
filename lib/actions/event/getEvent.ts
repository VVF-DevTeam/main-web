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

// Cached version to get the closest future event
export const getClosestFutureEvent = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    try {
      const now = new Date()
      
      const closestEvent = await prisma.event.findFirst({
        where: {
          isPublished: true,
          startDate: {
            gte: now, // Events that start in the future
          },
        },
        select: {
          id: true,
          title: true,
          keyName: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          eventType: true,
        },
        orderBy: {
          startDate: 'asc', // Get the closest one first
        },
      })

      return closestEvent
    } catch (error) {
      console.error('Error getting closest future event:', error)
      return null
    }
  },
  ['events-closest-future'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)


// Get all events (published and unpublished) - for admin use only
// Cached with revalidateTag support - cache is invalidated when events are created/updated/deleted
export const getAllEvents = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    try {
      const events = await prisma.event.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      })
      return events
    } catch (error) {
      console.error('Error getting all events:', error)
      return []
    }
  },
  ['events-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['events'], // Tag for revalidation
  }
)

// Get event title by keyName - lightweight cached function for minimal data needs
export const getEventTitleByKeyName = unstable_cache(
  async (eventKeyName: string) => {
    const { prisma } = await import('@/lib/db')
    try {
      const event = await prisma.event.findUnique({
        where: { keyName: eventKeyName },
        select: { title: true },
      })
      return event
    } catch (error) {
      console.error('Error getting event title by keyName:', error)
      return null
    }
  },
  ['event-title-by-keyname'], // Cache key prefix
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
