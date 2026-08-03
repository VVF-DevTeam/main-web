'use server'

import { unstable_cache } from 'next/cache'
import { Host } from '../../types/HostType'
import { Role as PrismaRole } from '@prisma/client'
import { withDbRetry } from '@/lib/db/withDbRetry'

// Cached version of getUsersWithRole
const getCachedUsersWithRole = unstable_cache(
  async (searchString: string, role: keyof typeof PrismaRole) => {
    const { prisma } = await import('../../db')
    return withDbRetry(
      () =>
        prisma.user.findMany({
          where: {
            name: {
              contains: searchString,
              mode: 'insensitive',
            },
            role: {
              has: PrismaRole[role],
            },
          },
          select: {
            id: true,
            name: true,
            role: true,
          },
        }),
      { label: 'getCachedUsersWithRole' }
    )
  },
  ['users-with-role'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['users'], // Tag for revalidation
  }
)

// Main function (maintains backward compatibility)
const getUsersWithRole = async (
  searchString: string,
  role: keyof typeof PrismaRole
): Promise<Host[]> => {
  return getCachedUsersWithRole(searchString, role)
}

export default getUsersWithRole
