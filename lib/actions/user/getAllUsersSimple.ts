'use server'
import { prisma } from '@/lib/db'
import { UserInfoSimpleProps } from '@/lib/types/userInfo'

interface GetUsersSimpleParams {
  count?: number
  nameSortString?: string
}

export async function getUsersSimple({
  count = 0,
  nameSortString = '',
}: GetUsersSimpleParams): Promise<UserInfoSimpleProps[]> {
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
}
