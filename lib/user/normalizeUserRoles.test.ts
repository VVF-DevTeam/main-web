import { describe, expect, it } from 'vitest'
import { Role } from '@prisma/client'
import { normalizeUserRoles } from './normalizeUserRoles'

describe('normalizeUserRoles', () => {
  it('returns USER for empty input', () => {
    expect(normalizeUserRoles(null)).toEqual([Role.USER])
    expect(normalizeUserRoles(undefined)).toEqual([Role.USER])
  })

  it('keeps valid role arrays', () => {
    expect(normalizeUserRoles([Role.ADMIN, Role.HOST])).toEqual([
      Role.ADMIN,
      Role.HOST,
    ])
  })

  it('parses Postgres enum array literals from Neon SQL', () => {
    expect(normalizeUserRoles('{ADMIN,HOST}')).toEqual([Role.ADMIN, Role.HOST])
    expect(normalizeUserRoles('{USER}')).toEqual([Role.USER])
  })

  it('parses comma-separated strings', () => {
    expect(normalizeUserRoles('ADMIN,HOST')).toEqual([Role.ADMIN, Role.HOST])
  })
})
