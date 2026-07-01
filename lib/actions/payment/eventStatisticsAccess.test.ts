import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/__mocks__/db'
import { auth } from '@/auth'
import { canAccessEventPaymentData } from './canAccessEventPaymentData'
import { getEventPayments } from './getEventPayments'
import { getEventRefundPayments } from './getEventRefundPayments'
import { getEventShopPayments } from './getEventShopPayments'

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  unstable_cache: <T>(callback: () => Promise<T>) => callback,
}))

const mockAuth = vi.mocked(auth)

beforeEach(() => {
  mockReset(prisma)
  vi.clearAllMocks()
})

describe('canAccessEventPaymentData', () => {
  test('denies access when the caller is not signed in', async () => {
    mockAuth.mockResolvedValue(null as any)

    await expect(canAccessEventPaymentData('event_1')).resolves.toBe(false)
    expect(prisma.event.findFirst).not.toHaveBeenCalled()
  })

  test('allows admins without checking host ownership', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'admin_1',
        role: [Role.ADMIN],
      },
    } as any)

    await expect(canAccessEventPaymentData('event_1')).resolves.toBe(true)
    expect(prisma.event.findFirst).not.toHaveBeenCalled()
  })

  test('denies hosts for events they do not own', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'host_1',
        role: [Role.HOST],
      },
    } as any)
    prisma.event.findFirst.mockResolvedValue(null)

    await expect(canAccessEventPaymentData('foreign_event')).resolves.toBe(false)
    expect(prisma.event.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'foreign_event',
        hosts: {
          some: {
            id: 'host_1',
          },
        },
      },
      select: {
        id: true,
      },
    })
  })
})

describe('event statistics payment actions', () => {
  test('short-circuit for foreign hosts before querying payment rows', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'host_1',
        role: [Role.HOST],
      },
    } as any)
    prisma.event.findFirst.mockResolvedValue(null)

    await expect(getEventPayments('foreign_event')).resolves.toEqual([])
    await expect(getEventShopPayments('foreign_event')).resolves.toEqual([])
    await expect(getEventRefundPayments('foreign_event')).resolves.toEqual([])

    expect(prisma.payment.findMany).not.toHaveBeenCalled()
  })

  test('returns refund rows for a host-owned event', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'host_1',
        role: [Role.HOST],
      },
    } as any)
    prisma.event.findFirst.mockResolvedValue({ id: 'owned_event' } as any)
    prisma.payment.findMany.mockResolvedValue([
      {
        id: 'refund_1',
        pricePaid: { toString: () => '42.5' },
        createdAt: new Date('2026-05-24T05:00:00.000Z'),
        quantity: 1,
        seatNumber: null,
        type: 'Refund',
        method: 'Stripe',
        stripePaymentId: 'pi_123',
        guestName: 'Guest Buyer',
        guestEmail: 'guest@example.com',
        guestPhone: '555-0100',
        note: 'Fraud review complete',
        user: null,
        monitorUser: {
          name: 'Admin Monitor',
        },
        event: {
          title: 'Owned Event',
          startDate: new Date('2026-07-01T00:00:00.000Z'),
          endDate: new Date('2026-07-02T00:00:00.000Z'),
          location: 'Toronto',
          keyName: 'owned-event',
        },
        eventTicket: {
          capacityPerTicket: 2,
          type: 'VIP',
        },
      },
    ] as any)

    const result = await getEventRefundPayments('owned_event')

    expect(result).toEqual([
      expect.objectContaining({
        id: 'refund_1',
        pricePaid: 42.5,
        note: 'Fraud review complete',
        eventTicket: {
          capacityPerTicket: 2,
          type: 'VIP',
        },
      }),
    ])
    expect(prisma.payment.findMany).toHaveBeenCalledWith({
      where: {
        eventId: 'owned_event',
        type: 'Refund',
      },
      select: {
        id: true,
        pricePaid: true,
        createdAt: true,
        quantity: true,
        seatNumber: true,
        type: true,
        method: true,
        stripePaymentId: true,
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        note: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        monitorUser: {
          select: {
            name: true,
          },
        },
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            keyName: true,
          },
        },
        eventTicket: {
          select: {
            capacityPerTicket: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
})
