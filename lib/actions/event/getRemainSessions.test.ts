import { describe, expect, test, beforeEach, vi } from 'vitest'
import { getRemainSessions } from './getRemainSessions'
import { prisma } from '@/lib/__mocks__/db'
import { mockReset } from 'vitest-mock-extended'

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

beforeEach(() => {
  mockReset(prisma)
})

describe('Testing getRemainSessions function', () => {
  test('should return 0 if the event has already ended', async () => {
    // Mock only returns the fields selected in the actual function
    prisma.event.findUnique.mockResolvedValue({
      days: [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ],
      endDate: new Date('2024-02-01'),
    } as any)

    const eventId = 'testingGetRemainSessions'
    const remainSessions = await getRemainSessions(eventId)
    expect(remainSessions).toBe(0)
  })
})
