import { Role } from '@prisma/client'

const ROLE_VALUES = new Set<string>(Object.values(Role))

/**
 * Ensures role is always a Role[].
 * Neon raw SQL and some JWT paths can return Postgres enum arrays as "{ADMIN,HOST}" strings.
 */
export function normalizeUserRoles(role: unknown): Role[] {
  if (role == null) return [Role.USER]

  if (Array.isArray(role)) {
    const normalized = role.filter(
      (value): value is Role =>
        typeof value === 'string' && ROLE_VALUES.has(value)
    )
    return normalized.length > 0 ? normalized : [Role.USER]
  }

  if (typeof role === 'string') {
    const trimmed = role.trim()
    if (!trimmed) return [Role.USER]

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1).trim()
      if (!inner) return [Role.USER]
      return normalizeUserRoles(
        inner.split(',').map((part) => part.trim().replace(/^"|"$/g, ''))
      )
    }

    if (trimmed.includes(',')) {
      return normalizeUserRoles(trimmed.split(',').map((part) => part.trim()))
    }

    if (ROLE_VALUES.has(trimmed)) return [trimmed as Role]
    return [Role.USER]
  }

  return [Role.USER]
}
