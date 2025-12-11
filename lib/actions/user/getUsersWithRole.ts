'use server'

import { unstable_cache } from 'next/cache'
import { Host } from '../../types/HostType'
import { Role as PrismaRole } from '@prisma/client'

// Cached version of getUsersWithRole
const getCachedUsersWithRole = unstable_cache(
  async (searchString: string, role: keyof typeof PrismaRole) => {
    const { prisma } = await import('../../db')
    try {
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: searchString,
            mode: 'insensitive',
          },
          role: {
            has: PrismaRole[role]
          }
        },
        select: {
          id: true,
          name: true,
          role: true,
        },
      })

      return users
    } catch (error) {
      console.log(error)
      return []
    }
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
