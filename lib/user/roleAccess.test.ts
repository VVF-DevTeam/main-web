import { describe, expect, it } from 'vitest'
import { Role } from '@prisma/client'
import { hasAdminAccess, hasAdminOrHostAccess, hasRole } from './roleAccess'

describe('roleAccess', () => {
  it('treats SUPERADMIN as ADMIN for admin checks', () => {
    expect(hasRole([Role.SUPERADMIN], Role.ADMIN)).toBe(true)
    expect(hasAdminAccess([Role.SUPERADMIN])).toBe(true)
  })

  it('keeps distinct checks for other roles', () => {
    expect(hasRole([Role.SUPERADMIN], Role.HOST)).toBe(false)
    expect(hasRole([Role.HOST], Role.ADMIN)).toBe(false)
  })

  it('hasAdminOrHostAccess includes superadmin and host', () => {
    expect(hasAdminOrHostAccess([Role.SUPERADMIN])).toBe(true)
    expect(hasAdminOrHostAccess([Role.HOST])).toBe(true)
    expect(hasAdminOrHostAccess([Role.USER])).toBe(false)
  })
})
