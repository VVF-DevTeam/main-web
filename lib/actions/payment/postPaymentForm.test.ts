import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { prisma } from '@/lib/__mocks__/db'
import {
  submitPostPaymentForm,
  verifyPostPaymentFormAccess,
} from './postPaymentForm'

const { revalidateTag, getEventForm } = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  getEventForm: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

vi.mock('next/cache', () => ({
  revalidateTag,
}))

vi.mock('@/lib/actions/event/getEventForm', () => ({
  getEventForm,
}))

beforeEach(() => {
  mockReset(prisma)
  vi.clearAllMocks()
})

describe('postPaymentForm actions', () => {
  test('verifyPostPaymentFormAccess accepts guest checkout links keyed by paymentRef', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      title: 'Camp Event',
    } as any)

    prisma.payment.findMany.mockResolvedValue([
      {
        id: 'payment-1',
        guestEmail: 'buyer@example.com',
        guestName: 'Buyer Name',
        otherGuests: [{ name: 'Guest One', email: 'guest@example.com' }],
        formResponses: null,
      },
    ] as any)

    getEventForm.mockResolvedValue([
      {
        questions: [
          {
            id: 'q1',
            question: 'Your name',
            type: 'text',
            required: true,
            options: [],
          },
        ],
      },
    ])

    const result = await verifyPostPaymentFormAccess({
      paymentRef: 'pi_guest_123',
      eventKeyName: 'camp-event',
      guestEmail: 'guest@example.com',
    })

    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        paymentId: 'payment-1',
        eventId: 'event-1',
        eventTitle: 'Camp Event',
        guestName: 'Guest One',
        alreadySubmitted: false,
      })
    )

    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          eventId: 'event-1',
          refunded: false,
          stripePaymentId: 'pi_guest_123',
        }),
      })
    )
  })

  test('submitPostPaymentForm retries on concurrent updates instead of dropping another guest response', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
      title: 'Camp Event',
    } as any)

    prisma.payment.findMany.mockResolvedValue([
      {
        id: 'payment-1',
        guestEmail: 'guest@example.com',
        guestName: 'Guest One',
        otherGuests: [],
        formResponses: null,
      },
    ] as any)

    getEventForm.mockResolvedValue([
      {
        questions: [
          {
            id: 'q1',
            question: 'Dietary restrictions',
            type: 'text',
            required: false,
            options: [],
          },
        ],
      },
    ])

    const firstUpdatedAt = new Date('2026-05-29T00:00:00.000Z')
    const secondUpdatedAt = new Date('2026-05-29T00:00:01.000Z')
    const concurrentBlock = {
      email: 'other@example.com',
      responses: [
        {
          questionId: 'q1',
          question: 'Dietary restrictions',
          answer: 'Vegetarian',
          questionType: 'text',
          required: false,
          options: [],
          formNumber: 1,
        },
      ],
    }

    prisma.payment.findUnique
      .mockResolvedValueOnce({
        formResponses: [],
        updatedAt: firstUpdatedAt,
      } as any)
      .mockResolvedValueOnce({
        formResponses: [concurrentBlock],
        updatedAt: secondUpdatedAt,
      } as any)

    prisma.payment.updateMany
      .mockResolvedValueOnce({ count: 0 } as any)
      .mockResolvedValueOnce({ count: 1 } as any)

    const result = await submitPostPaymentForm({
      paymentId: 'payment-1',
      paymentRef: 'pi_guest_123',
      eventKeyName: 'camp-event',
      guestEmail: 'guest@example.com',
      formResponses: {
        q1: {
          answer: 'No peanuts',
          formNumber: 1,
        },
      },
    })

    expect(result).toEqual({ success: true })
    expect(prisma.payment.updateMany).toHaveBeenCalledTimes(2)
    expect(prisma.payment.updateMany).toHaveBeenLastCalledWith({
      where: {
        id: 'payment-1',
        updatedAt: secondUpdatedAt,
      },
      data: {
        formResponses: [
          concurrentBlock,
          {
            email: 'guest@example.com',
            responses: [
              {
                questionId: 'q1',
                question: 'Dietary restrictions',
                answer: 'No peanuts',
                questionType: 'text',
                required: false,
                options: [],
                formNumber: 1,
              },
            ],
          },
        ],
      },
    })
    expect(revalidateTag).toHaveBeenCalledWith('payments')
  })
})
