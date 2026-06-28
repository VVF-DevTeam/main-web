import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { prisma } from '@/lib/__mocks__/db'
import { auth } from '@/auth'
import { revalidateTag } from 'next/cache'
import { sendRefundConfirmationEmail } from '@/lib/actions/email/sendRefundConfirmationEmail'
import { POST } from './route'

const stripeMocks = {
  paymentIntents: {
    retrieve: vi.fn(),
  },
  refunds: {
    list: vi.fn(),
    create: vi.fn(),
  },
  subscriptions: {
    cancel: vi.fn(),
  },
}

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/actions/email/sendRefundConfirmationEmail', () => ({
  sendRefundConfirmationEmail: vi.fn(),
}))

vi.mock('stripe', () => ({
  default: class Stripe {
    paymentIntents = stripeMocks.paymentIntents
    refunds = stripeMocks.refunds
    subscriptions = stripeMocks.subscriptions
  },
}))

const mockAuth = vi.mocked(auth)
const mockRevalidateTag = vi.mocked(revalidateTag)
const mockSendRefundConfirmationEmail = vi.mocked(sendRefundConfirmationEmail)

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

  prisma.payment.findUnique.mockResolvedValue({
    stripePaymentId: 'pi_shared',
    pricePaid: 60,
    type: 'Event',
    eventId: 'event_1',
    userId: 'user_1',
    eventTicketId: 'ticket_a',
    quantity: 1,
    refunded: false,
    guestName: 'Buyer Name',
    guestEmail: 'buyer@example.com',
    guestPhone: '555-0100',
    user: {
      stripeSubscriptionId: null,
      name: 'Buyer Name',
      email: 'buyer@example.com',
    },
    event: {
      title: 'Summer Camp',
      startDate: new Date('2026-06-01T00:00:00.000Z'),
      endDate: new Date('2026-06-02T00:00:00.000Z'),
      location: 'Toronto',
    },
  } as any)

  prisma.payment.updateMany.mockResolvedValue({ count: 2 } as any)
  prisma.payment.create.mockResolvedValue({ id: 'refund_payment_1' } as any)
  prisma.event.update.mockResolvedValue({ id: 'event_1' } as any)

  stripeMocks.paymentIntents.retrieve.mockResolvedValue({
    amount_received: 10000,
    amount: 10000,
  })
  stripeMocks.refunds.list.mockResolvedValue({
    data: [
      {
        status: 'succeeded',
        amount: 6000,
      },
    ],
  })
  stripeMocks.refunds.create.mockResolvedValue({
    amount: 4000,
    id: 're_1',
  })
})

describe('refund route', () => {
  test('marks every purchase row refunded when the shared payment intent becomes fully refunded', async () => {
    const response = await POST(
      new Request('http://localhost/api/payment/refund', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: 'payment_row_b',
          amount: 40,
          monitorUserId: 'admin_1',
          note: 'Final refund',
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: {
        stripePaymentId: 'pi_shared',
        type: {
          not: 'Refund',
        },
      },
      data: {
        updatedAt: expect.any(Date),
        refunded: true,
        totalRefundAmount: 100,
        monitorUserId: 'admin_1',
      },
    })
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'Refund',
        pricePaid: 40,
        userId: 'user_1',
        eventId: 'event_1',
        eventTicketId: 'ticket_a',
        note: 'Final refund',
      }),
    })
    expect(prisma.event.update).toHaveBeenCalledWith({
      where: { id: 'event_1' },
      data: {
        hosts: {
          disconnect: {
            id: 'user_1',
          },
        },
      },
    })
    expect(mockSendRefundConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(mockRevalidateTag).toHaveBeenCalledWith('payments')
  })
})
