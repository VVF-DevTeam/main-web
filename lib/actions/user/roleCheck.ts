import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { normalizeUserRoles } from '@/lib/user/normalizeUserRoles'
import { hasRole } from '@/lib/user/roleAccess'
type role = Role

interface StatusCheckProps {
  role?: role
}

export async function roleCheck({ role }: StatusCheckProps) {
  const session = await auth()
  const roles = normalizeUserRoles(session?.user?.role)

  if (role) {
    return hasRole(roles, role)
  }

  return roles
}
