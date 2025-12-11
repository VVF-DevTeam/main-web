'use server'

import { unstable_cache } from 'next/cache'
import { UserInfoSimpleProps } from '@/lib/types/userInfo'

interface GetUsersSimpleParams {
  count?: number
  nameSortString?: string
}

// Cached version of getUsersSimple
const getCachedUsersSimple = unstable_cache(
  async ({ count = 0, nameSortString = '' }: GetUsersSimpleParams) => {
    const { prisma } = await import('@/lib/db')
    let users = []
    if (count > 0) {
      users = await prisma.user.findMany({
        take: count,
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          name: {
            contains: nameSortString,
            mode: 'insensitive',
          },
        },
      })
    } else {
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          name: {
            contains: nameSortString,
            mode: 'insensitive',
          },
        },
      })
    }

    return users.map((user) => ({
      id: user.id,
      name: user.name ?? '',
      email: user.email,
    }))
  },
  ['users-simple'], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['users'], // Tag for revalidation
  }
)

// Main function (maintains backward compatibility)
export async function getUsersSimple({
  count = 0,
  nameSortString = '',
}: GetUsersSimpleParams): Promise<UserInfoSimpleProps[]> {
  return getCachedUsersSimple({ count, nameSortString })
}
