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

