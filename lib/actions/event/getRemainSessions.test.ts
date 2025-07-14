import { describe, expect, jest, test, beforeEach } from '@jest/globals'
import { getRemainSessions } from './getRemainSessions'
import { prisma } from '@/lib/__mocks__/db'
import { mockReset } from 'jest-mock-extended'

jest.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

beforeEach(() => {
  mockReset(prisma)
})

describe('Testing getRemainSessions function', () => {
  test('should return 0 if the event has already ended', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'testingGetRemainSessions',
      title: 'Test Event',
      subtitle: null,
      description: null,
      location: null,
      startTime: null,
      endTime: null,
      capacity: null,
      ticketsSold: null,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      eventType: 'CONCERT',
      formLink: null,
      fullCourseDiscount: null,
      imgUrl: null,
      subImgUrls: null,
      imgUrls: null,
      isPublished: false,
      keyName: 'test-event',
      price: null,
      startDate: new Date('2024-01-01'),
      stripePriceId: null,
      stripeProductId: null,
      subscribedPriceId: null,
      socialLinks: null,
    })

    const eventId = 'testingGetRemainSessions'
    const remainSessions = await getRemainSessions(eventId)
    expect(remainSessions).toBe(0)
  })
})
