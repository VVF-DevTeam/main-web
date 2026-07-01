'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'

function isAdminRole(roles: Role[]) {
  return roles.includes(Role.ADMIN) || roles.includes(Role.SUPERADMIN)
}

export async function canAccessEventPaymentData(eventId: string) {
  const session = await auth()
  const userId = session?.user?.id
  const roles = (session?.user?.role ?? []) as Role[]

  if (!userId) {
    return false
  }

  if (isAdminRole(roles)) {
    return true
  }

  if (!roles.includes(Role.HOST)) {
    return false
  }

  const hostedEvent = await prisma.event.findFirst({
    where: {
      id: eventId,
      hosts: {
        some: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
    },
  })

  return Boolean(hostedEvent)
}
