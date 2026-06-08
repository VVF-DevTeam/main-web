import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { prisma } from '@/lib/__mocks__/db'
import { auth } from '@/auth'
import { revalidateTag } from 'next/cache'

const stripeMocks = vi.hoisted(() => ({
  retrievePaymentIntent: vi.fn(),
  listRefunds: vi.fn(),
  createRefund: vi.fn(),
  cancelSubscription: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/actions/email/sendRefundConfirmationEmail', () => ({
  sendRefundConfirmationEmail: vi.fn(),
}))

vi.mock('stripe', () => ({
  default: class StripeMock {
    paymentIntents = {
      retrieve: stripeMocks.retrievePaymentIntent,
    }

    refunds = {
      list: stripeMocks.listRefunds,
      create: stripeMocks.createRefund,
    }

    subscriptions = {
      cancel: stripeMocks.cancelSubscription,
    }
  },
}))

import { POST } from './route'

const mockAuth = vi.mocked(auth)
const mockRevalidateTag = vi.mocked(revalidateTag)

const sharedIntentPaymentRow = {
  stripePaymentId: 'pi_shared_123',
  pricePaid: 30,
  totalRefundAmount: null,
  type: 'Event',
  eventId: 'event_1',
  userId: 'user_1',
  eventTicketId: 'ticket_a',
  quantity: 1,
  refunded: false,
  guestName: null,
  guestEmail: 'buyer@example.com',
  guestPhone: null,
  user: {
    stripeSubscriptionId: null,
    name: 'Buyer Name',
    email: 'buyer@example.com',
  },
  event: {
    title: 'Camp Ticket',
    startDate: new Date('2026-07-01T10:00:00.000Z'),
    endDate: new Date('2026-07-01T12:00:00.000Z'),
    location: 'Montreal',
  },
} as any

function buildRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/payment/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  mockReset(prisma)
  vi.clearAllMocks()

  mockAuth.mockResolvedValue({
    user: {
      id: 'admin_1',
    },
  } as any)

  prisma.user.findUnique.mockResolvedValue({
    role: ['ADMIN'],
  } as any)

  prisma.payment.findUnique.mockResolvedValue(sharedIntentPaymentRow)
  prisma.payment.update.mockResolvedValue({ id: 'pay_row_a' } as any)
  prisma.payment.create.mockResolvedValue({ id: 'refund_row' } as any)
  prisma.event.update.mockResolvedValue({ id: 'event_1' } as any)

  stripeMocks.retrievePaymentIntent.mockResolvedValue({
    amount_received: 10000,
    amount: 10000,
  })
  stripeMocks.listRefunds.mockResolvedValue({
    data: [],
  })
  stripeMocks.createRefund.mockResolvedValue({
    id: 're_123',
    amount: 3000,
  })
})

describe('POST /api/payment/refund', () => {
  test('marks the selected row refunded when its own full amount is refunded from a shared intent', async () => {
    const response = await POST(
      buildRequest({
        paymentId: 'pay_row_a',
        amount: 30,
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(200)
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay_row_a' },
      data: expect.objectContaining({
        refunded: true,
        totalRefundAmount: 30,
        monitorUserId: 'admin_1',
      }),
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith('payments')
  })

  test('defaults missing amount to the selected row remaining amount instead of the full shared intent', async () => {
    stripeMocks.createRefund.mockResolvedValueOnce({
      id: 're_456',
      amount: 3000,
    })

    const response = await POST(
      buildRequest({
        paymentId: 'pay_row_a',
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(200)
    expect(stripeMocks.createRefund).toHaveBeenCalledWith({
      payment_intent: 'pi_shared_123',
      amount: 3000,
    })
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay_row_a' },
      data: expect.objectContaining({
        refunded: true,
        totalRefundAmount: 30,
      }),
    })
  })

  test('rejects refund amounts that exceed the selected row amount even when the shared intent still has funds', async () => {
    const response = await POST(
      buildRequest({
        paymentId: 'pay_row_a',
        amount: 100,
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(400)
    await expect(response.text()).resolves.toBe('Refund amount exceeds remaining refundable amount')
    expect(stripeMocks.createRefund).not.toHaveBeenCalled()
    expect(prisma.payment.update).not.toHaveBeenCalled()
  })
})
