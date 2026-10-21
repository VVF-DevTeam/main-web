import { Role } from '@prisma/client'
import { normalizeUserRoles } from '@/lib/user/normalizeUserRoles'

/** SUPERADMIN is treated as having ADMIN privileges for access checks. */
export function hasRole(roles: unknown, role: Role): boolean {
  const normalized = normalizeUserRoles(roles)
  if (role === Role.ADMIN) {
    return (
      normalized.includes(Role.ADMIN) || normalized.includes(Role.SUPERADMIN)
    )
  }
  return normalized.includes(role)
}

export function hasAdminAccess(roles: unknown): boolean {
  return hasRole(roles, Role.ADMIN)
}

export function hasAdminOrHostAccess(roles: unknown): boolean {
  const normalized = normalizeUserRoles(roles)
  return hasAdminAccess(normalized) || normalized.includes(Role.HOST)
}
