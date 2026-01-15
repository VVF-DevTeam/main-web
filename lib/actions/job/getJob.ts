'use server'

import { unstable_cache } from 'next/cache'

// Get all jobs (both published and unpublished) for admin management
export const getAllJobs = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    try {
      const jobs = await prisma.job.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      })
      return jobs
    } catch (error) {
      console.error('Error getting all jobs:', error)
      return []
    }
  },
  ['jobs-all'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['jobs'], // Tag for revalidation
  }
)

// Get published jobs with optional filters (title search and event filter)
export const getPublishedJobs = unstable_cache(
  async (filters?: { title?: string; eventKeyName?: string }) => {
    const { prisma } = await import('@/lib/db')
    try {
      // Build where clause
      const whereClause: any = {
        isPublished: true,
      }

      // Add title filter if provided
      if (filters?.title) {
        whereClause.title = {
          contains: filters.title,
          mode: 'insensitive',
        }
      }

      // Add event filter if provided and not 'all'
      if (filters?.eventKeyName && filters.eventKeyName !== 'all') {
        whereClause.event = {
          keyName: filters.eventKeyName,
        }
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              keyName: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
      return jobs
    } catch (error) {
      console.error('Error getting published jobs:', error)
      return []
    }
  },
  ['jobs-published'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['jobs'], // Tag for revalidation
  }
)
