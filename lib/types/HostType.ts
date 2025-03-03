import { Role as PrismaRole } from '@prisma/client'

export type Host = {
    name: string | null
    id: string
    role: keyof typeof PrismaRole
  }