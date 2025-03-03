'use server'
import { Host } from '../types/HostType'
import { prisma } from '../db'
import { Role as PrismaRole } from '@prisma/client'

const getUsers = async (
  searchString: string,
  role: keyof typeof PrismaRole
): Promise<Host[]> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchString,
          mode: 'insensitive',
        },
        role: PrismaRole[role],
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
}

export default getUsers
