import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/__mocks__/db'
import { auth } from '@/auth'
import { revalidateTag } from 'next/cache'
import { sendRefundConfirmationEmail } from '@/lib/actions/email/sendRefundConfirmationEmail'

const stripeMock = {
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

vi.mock('stripe', () => ({
  __esModule: true,
  default: vi.fn(() => stripeMock),
}))

vi.mock('@/auth', () => ({
  __esModule: true,
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

import { POST } from './route'

const mockAuth = vi.mocked(auth)
const mockRevalidateTag = vi.mocked(revalidateTag)
const mockSendRefundConfirmationEmail = vi.mocked(sendRefundConfirmationEmail)

function buildRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/payment/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/payment/refund', () => {
  beforeEach(() => {
    mockReset(prisma)
    vi.clearAllMocks()

    mockAuth.mockResolvedValue({
      user: { id: 'admin_1' },
    } as any)
    prisma.user.findUnique.mockResolvedValue({
      role: [Role.ADMIN],
    } as any)
    prisma.payment.findUnique.mockResolvedValue({
      stripePaymentId: 'pi_shared',
      pricePaid: 50,
      totalRefundAmount: 0,
      type: 'Event',
      eventId: 'event_1',
      userId: 'user_1',
      eventTicketId: 'ticket_1',
      quantity: 1,
      refunded: false,
      guestName: 'Buyer',
      guestEmail: 'buyer@example.com',
      guestPhone: '555-555-5555',
      user: {
        stripeSubscriptionId: null,
        name: 'Buyer User',
        email: 'buyer@example.com',
      },
      event: {
        title: 'Camp',
        startDate: new Date('2026-06-10T00:00:00.000Z'),
        endDate: new Date('2026-06-12T00:00:00.000Z'),
        location: 'Vancouver',
      },
    } as any)
    prisma.payment.update.mockResolvedValue({} as any)
    prisma.payment.create.mockResolvedValue({} as any)
    prisma.event.update.mockResolvedValue({} as any)
    prisma.user.update.mockResolvedValue({} as any)

    stripeMock.paymentIntents.retrieve.mockResolvedValue({
      amount_received: 8000,
      amount: 8000,
    } as any)
    stripeMock.refunds.list.mockResolvedValue({
      data: [],
    } as any)
    stripeMock.refunds.create.mockResolvedValue({
      amount: 5000,
    } as any)

    mockSendRefundConfirmationEmail.mockResolvedValue(undefined as any)
  })

  test('marks the selected payment row refunded even when the shared Stripe intent still has other active rows', async () => {
    const response = await POST(
      buildRequest({
        paymentId: 'payment_row_1',
        amount: 50,
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(200)
    expect(stripeMock.refunds.create).toHaveBeenCalledWith({
      payment_intent: 'pi_shared',
      amount: 5000,
    })
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment_row_1' },
      data: expect.objectContaining({
        refunded: true,
        totalRefundAmount: 50,
        monitorUserId: 'admin_1',
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
    expect(mockRevalidateTag).toHaveBeenCalledWith('payments')
  })

  test('stores only the selected row refund total when other rows on the same Stripe intent were already refunded', async () => {
    prisma.payment.findUnique.mockResolvedValueOnce({
      stripePaymentId: 'pi_shared',
      pricePaid: 50,
      totalRefundAmount: 20,
      type: 'Event',
      eventId: 'event_1',
      userId: 'user_1',
      eventTicketId: 'ticket_1',
      quantity: 1,
      refunded: false,
      guestName: 'Buyer',
      guestEmail: 'buyer@example.com',
      guestPhone: '555-555-5555',
      user: {
        stripeSubscriptionId: null,
        name: 'Buyer User',
        email: 'buyer@example.com',
      },
      event: {
        title: 'Camp',
        startDate: new Date('2026-06-10T00:00:00.000Z'),
        endDate: new Date('2026-06-12T00:00:00.000Z'),
        location: 'Vancouver',
      },
    } as any)
    stripeMock.paymentIntents.retrieve.mockResolvedValueOnce({
      amount_received: 10000,
      amount: 10000,
    } as any)
    stripeMock.refunds.list.mockResolvedValueOnce({
      data: [
        { status: 'succeeded', amount: 2000 },
        { status: 'succeeded', amount: 1500 },
      ],
    } as any)
    stripeMock.refunds.create.mockResolvedValueOnce({
      amount: 1000,
    } as any)

    const response = await POST(
      buildRequest({
        paymentId: 'payment_row_1',
        amount: 10,
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(200)
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment_row_1' },
      data: expect.objectContaining({
        refunded: false,
        totalRefundAmount: 30,
      }),
    })
    expect(prisma.event.update).not.toHaveBeenCalled()
  })

  test('rejects refunds that exceed the selected row remaining amount even if the Stripe intent has enough headroom', async () => {
    prisma.payment.findUnique.mockResolvedValueOnce({
      stripePaymentId: 'pi_shared',
      pricePaid: 50,
      totalRefundAmount: 20,
      type: 'Event',
      eventId: 'event_1',
      userId: 'user_1',
      eventTicketId: 'ticket_1',
      quantity: 1,
      refunded: false,
      guestName: 'Buyer',
      guestEmail: 'buyer@example.com',
      guestPhone: '555-555-5555',
      user: {
        stripeSubscriptionId: null,
        name: 'Buyer User',
        email: 'buyer@example.com',
      },
      event: {
        title: 'Camp',
        startDate: new Date('2026-06-10T00:00:00.000Z'),
        endDate: new Date('2026-06-12T00:00:00.000Z'),
        location: 'Vancouver',
      },
    } as any)
    stripeMock.paymentIntents.retrieve.mockResolvedValueOnce({
      amount_received: 10000,
      amount: 10000,
    } as any)
    stripeMock.refunds.list.mockResolvedValueOnce({
      data: [{ status: 'succeeded', amount: 2000 }],
    } as any)

    const response = await POST(
      buildRequest({
        paymentId: 'payment_row_1',
        amount: 40,
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe(
      'Refund amount exceeds remaining refundable amount'
    )
    expect(stripeMock.refunds.create).not.toHaveBeenCalled()
    expect(prisma.payment.update).not.toHaveBeenCalled()
  })
})
