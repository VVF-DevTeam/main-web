import { PrismaClient } from '@prisma/client'
import {
  ensureNeonConnectionParams,
  warnIfMissingPoolerInProduction,
} from '@/lib/db/connectionString'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
  warnIfMissingPoolerInProduction()

  const databaseUrl = ensureNeonConnectionParams(process.env.DATABASE_URL)

  if (!databaseUrl) {
    return new PrismaClient()
  }

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

globalForPrisma.prisma = prisma
