import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { prisma } from '@/lib/__mocks__/db'

const { mockStripeClient } = vi.hoisted(() => ({
  mockStripeClient: {
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
  },
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

vi.mock('stripe', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => mockStripeClient),
}))

import { auth } from '@/auth'
import { revalidateTag } from 'next/cache'
import { sendRefundConfirmationEmail } from '@/lib/actions/email/sendRefundConfirmationEmail'
import { POST } from './route'

const mockAuth = vi.mocked(auth)
const mockRevalidateTag = vi.mocked(revalidateTag)
const mockSendRefundConfirmationEmail = vi.mocked(sendRefundConfirmationEmail)

function buildRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/payment/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('payment refund route', () => {
  beforeEach(() => {
    mockReset(prisma)
    vi.clearAllMocks()

    mockAuth.mockResolvedValue({
      user: { id: 'admin_1' },
    } as any)

    prisma.user.findUnique.mockResolvedValue({
      role: ['ADMIN'],
    } as any)

    mockStripeClient.paymentIntents.retrieve.mockResolvedValue({
      amount_received: 15000,
      amount: 15000,
    } as any)
    mockStripeClient.refunds.list.mockResolvedValue({
      data: [],
    } as any)
    mockStripeClient.refunds.create.mockResolvedValue({
      amount: 5000,
    } as any)

    prisma.payment.update.mockResolvedValue({} as any)
    prisma.payment.create.mockResolvedValue({} as any)
    prisma.event.update.mockResolvedValue({} as any)
  })

  test('marks a split-checkout row refunded when that row is fully refunded', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      stripePaymentId: 'pi_split',
      pricePaid: 50,
      totalRefundAmount: null,
      type: 'Concert',
      eventId: 'event_1',
      userId: null,
      eventTicketId: 'ticket_1',
      quantity: 1,
      refunded: false,
      guestName: 'Guest Buyer',
      guestEmail: 'guest@example.com',
      guestPhone: null,
      user: {
        stripeSubscriptionId: null,
        name: 'Guest Buyer',
        email: 'guest@example.com',
      },
      event: {
        title: 'Festival',
        startDate: new Date('2026-06-01T00:00:00.000Z'),
        endDate: new Date('2026-06-02T00:00:00.000Z'),
        location: 'Venue',
      },
    } as any)

    const response = await POST(
      buildRequest({
        paymentId: 'payment_row_a',
        amount: 50,
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(200)
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment_row_a' },
      data: expect.objectContaining({
        refunded: true,
        totalRefundAmount: 50,
        monitorUserId: 'admin_1',
      }),
    })
    expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
      payment_intent: 'pi_split',
      amount: 5000,
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith('payments')
    expect(mockSendRefundConfirmationEmail).toHaveBeenCalled()
  })

  test('rejects refund amounts above the selected row balance', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      stripePaymentId: 'pi_split',
      pricePaid: 50,
      totalRefundAmount: 10,
      type: 'Concert',
      eventId: 'event_1',
      userId: null,
      eventTicketId: 'ticket_1',
      quantity: 1,
      refunded: false,
      guestName: 'Guest Buyer',
      guestEmail: 'guest@example.com',
      guestPhone: null,
      user: {
        stripeSubscriptionId: null,
        name: 'Guest Buyer',
        email: 'guest@example.com',
      },
      event: {
        title: 'Festival',
        startDate: new Date('2026-06-01T00:00:00.000Z'),
        endDate: new Date('2026-06-02T00:00:00.000Z'),
        location: 'Venue',
      },
    } as any)

    const response = await POST(
      buildRequest({
        paymentId: 'payment_row_a',
        amount: 50,
        monitorUserId: 'admin_1',
      })
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe(
      'Refund amount exceeds remaining refundable amount for this payment'
    )
    expect(mockStripeClient.refunds.create).not.toHaveBeenCalled()
    expect(prisma.payment.update).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})
