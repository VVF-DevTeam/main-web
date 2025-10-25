'use server'

import { Prisma } from '@prisma/client'

export async function getAllPublishedEvents(selectFields: Prisma.EventSelect = { id: true, title: true }) {
  const { prisma } = await import('@/lib/db')
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
      },
      select: selectFields,
    })

    return events
  } catch (error) {
    console.error('Error getting published events:', error)
    return []
  }
}

export async function getPublishedEventsWithFilters({
  numberOfEvents,
  upcoming,
  finished,
  orderByField,
  orderDirection,
  includeCategories,
  selectFields, // no select fields means include all fields
}: {
  numberOfEvents: number
  upcoming: boolean
  finished: boolean
  orderByField?: string
  orderDirection?: 'asc' | 'desc'
  includeCategories?: boolean
  selectFields?: Prisma.EventSelect
}) {
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
          select: {...selectFields, categories: includeCategories ? true : false },
        })
      : await prisma.event.findMany({
          ...baseQuery,
          include: { categories: includeCategories ? true : false },
        })

    return events
  } catch (error) {
    console.error('Error getting published events:', error)
    return []
  }
}

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
