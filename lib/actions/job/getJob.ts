'use server'

import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Get all jobs (both published and unpublished) for admin management
export const getAllJobs = unstable_cache(
  async () => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.job.findMany({
          orderBy: {
            updatedAt: 'desc',
          },
        }),
      { label: 'getAllJobs' }
    )
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
    return withDbRetry(async () => {
      const whereClause: {
        isPublished: boolean
        title?: { contains: string; mode: 'insensitive' }
        event?: { keyName: string }
      } = {
        isPublished: true,
      }

      if (filters?.title) {
        whereClause.title = {
          contains: filters.title,
          mode: 'insensitive',
        }
      }

      if (filters?.eventKeyName && filters.eventKeyName !== 'all') {
        whereClause.event = {
          keyName: filters.eventKeyName,
        }
      }

      return prisma.job.findMany({
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
    }, { label: 'getPublishedJobs' })
  },
  ['jobs-published'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (revalidateTag handles on-demand invalidation)
    tags: ['jobs'], // Tag for revalidation
  }
)

// Get job by keyName specifically for editing
// Includes event relation for the edit job form
export const getJobForEditing = unstable_cache(
  async (jobKeyName: string) => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(
      () =>
        prisma.job.findUnique({
          where: {
            keyName: jobKeyName,
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
      { label: 'getJobForEditing' }
    )
  },
  ['job-for-editing'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour (shorter since this is for editing)
    tags: ['jobs'], // Tag for revalidation
  }
)

// Type inference: Extract the return type of getJobForEditing and unwrap Promise and null
export type JobForEditing = NonNullable<
  Awaited<ReturnType<typeof getJobForEditing>>
>
