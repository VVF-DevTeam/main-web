import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { prisma } from '@/lib/__mocks__/db'
import { getEventForm } from '@/lib/actions/event/getEventForm'
import { revalidateTag } from 'next/cache'
import { createPostPaymentFormAccessToken } from '@/lib/utils/postPaymentFormAccessToken'
import {
  submitPostPaymentForm,
  verifyPostPaymentFormAccess,
} from './postPaymentForm'

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

vi.mock('@/lib/actions/event/getEventForm', () => ({
  getEventForm: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

const mockGetEventForm = vi.mocked(getEventForm)
const mockRevalidateTag = vi.mocked(revalidateTag)

const eventFormData = [
  {
    questions: [
      {
        id: 'q1',
        question: 'Dietary restrictions',
        type: 'text',
        required: true,
        options: [],
      },
    ],
  },
] as any

const submittedResponses = {
  q1: {
    answer: 'Vegetarian',
    formNumber: 1,
  },
}

const originalAuthSecret = process.env.AUTH_SECRET

beforeEach(() => {
  process.env.AUTH_SECRET = 'test-auth-secret'
  mockReset(prisma)
  vi.clearAllMocks()
  mockGetEventForm.mockResolvedValue(eventFormData)
  prisma.event.findUnique.mockResolvedValue({
    id: 'event_1',
    title: 'Camp',
  } as any)
  prisma.payment.findMany.mockResolvedValue([
    {
      id: 'payment_1',
      guestEmail: 'buyer@example.com',
      guestName: 'Buyer',
      otherGuests: [{ name: 'Guest', email: 'guest@example.com' }],
      formResponses: null,
    },
  ] as any)
})

afterAll(() => {
  process.env.AUTH_SECRET = originalAuthSecret
})

function createAccessToken(overrides?: {
  userId?: string | null
  paymentReference?: string | null
  eventKeyName?: string
  guestEmail?: string
}) {
  const token = createPostPaymentFormAccessToken({
    userId: overrides?.userId ?? 'user_1',
    paymentReference: overrides?.paymentReference ?? null,
    eventKeyName: overrides?.eventKeyName ?? 'camp',
    guestEmail: overrides?.guestEmail ?? 'guest@example.com',
  })

  if (!token) {
    throw new Error('Expected test access token to be created')
  }

  return token
}

describe('postPaymentForm actions', () => {
  test('uses paymentReference before userId so repeat purchases do not bind to the wrong payment', async () => {
    prisma.payment.findMany.mockResolvedValueOnce([
      {
        id: 'payment_old',
        guestEmail: 'buyer@example.com',
        guestName: 'Buyer',
        otherGuests: [{ name: 'Guest', email: 'guest@example.com' }],
        formResponses: null,
      },
    ] as any)

    const result = await verifyPostPaymentFormAccess({
      userId: 'user_1',
      paymentReference: 'pi_old',
      eventKeyName: 'camp',
      guestEmail: 'guest@example.com',
      accessToken: createAccessToken({ paymentReference: 'pi_old' }),
    })

    expect(result).toMatchObject({
      success: true,
      paymentId: 'payment_old',
      alreadySubmitted: false,
    })
    expect(prisma.payment.findMany).toHaveBeenCalledWith({
      where: {
        eventId: 'event_1',
        refunded: false,
        stripePaymentId: 'pi_old',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        guestEmail: true,
        guestName: true,
        otherGuests: true,
        formResponses: true,
      },
    })
  })

  test('rejects tampered guest email even when the payment reference is valid', async () => {
    const result = await verifyPostPaymentFormAccess({
      paymentReference: 'pi_shared',
      eventKeyName: 'camp',
      guestEmail: 'buyer@example.com',
      accessToken: createAccessToken({
        paymentReference: 'pi_shared',
        guestEmail: 'guest@example.com',
      }),
    })

    expect(result).toEqual({ success: false, error: 'missing_params' })
    expect(prisma.event.findUnique).not.toHaveBeenCalled()
    expect(prisma.payment.findMany).not.toHaveBeenCalled()
  })

  test('retries conflicting writes so concurrent guest submissions are preserved', async () => {
    const firstReadAt = new Date('2026-05-28T11:00:00.000Z')
    const secondReadAt = new Date('2026-05-28T11:00:01.000Z')
    const concurrentGuestBlock = {
      email: 'other@example.com',
      responses: [
        {
          questionId: 'q1',
          question: 'Dietary restrictions',
          answer: 'Vegan',
          questionType: 'text',
          required: true,
          options: [],
          formNumber: 1,
        },
      ],
    }
    const newGuestBlock = {
      email: 'guest@example.com',
      responses: [
        {
          questionId: 'q1',
          question: 'Dietary restrictions',
          answer: 'Vegetarian',
          questionType: 'text',
          required: true,
          options: [],
          formNumber: 1,
        },
      ],
    }

    prisma.payment.findUnique
      .mockResolvedValueOnce({
        formResponses: null,
        updatedAt: firstReadAt,
      } as any)
      .mockResolvedValueOnce({
        formResponses: [concurrentGuestBlock],
        updatedAt: secondReadAt,
      } as any)
    prisma.payment.updateMany
      .mockResolvedValueOnce({ count: 0 } as any)
      .mockResolvedValueOnce({ count: 1 } as any)

    const result = await submitPostPaymentForm({
      paymentId: 'payment_1',
      userId: 'user_1',
      eventKeyName: 'camp',
      guestEmail: 'guest@example.com',
      accessToken: createAccessToken(),
      formResponses: submittedResponses,
    })

    expect(result).toEqual({ success: true })
    expect(prisma.payment.updateMany).toHaveBeenCalledTimes(2)
    expect(prisma.payment.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: 'payment_1',
        updatedAt: firstReadAt,
      },
      data: {
        formResponses: [newGuestBlock],
      },
    })
    expect(prisma.payment.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'payment_1',
        updatedAt: secondReadAt,
      },
      data: {
        formResponses: [concurrentGuestBlock, newGuestBlock],
      },
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith('payments')
  })

  test('returns already_submitted if a retry sees the same guest saved by another request', async () => {
    const firstReadAt = new Date('2026-05-28T11:00:00.000Z')
    const secondReadAt = new Date('2026-05-28T11:00:01.000Z')
    const sameGuestBlock = {
      email: 'guest@example.com',
      responses: [
        {
          questionId: 'q1',
          question: 'Dietary restrictions',
          answer: 'Vegetarian',
          questionType: 'text',
          required: true,
          options: [],
          formNumber: 1,
        },
      ],
    }

    prisma.payment.findUnique
      .mockResolvedValueOnce({
        formResponses: null,
        updatedAt: firstReadAt,
      } as any)
      .mockResolvedValueOnce({
        formResponses: [sameGuestBlock],
        updatedAt: secondReadAt,
      } as any)
    prisma.payment.updateMany.mockResolvedValueOnce({ count: 0 } as any)

    const result = await submitPostPaymentForm({
      paymentId: 'payment_1',
      userId: 'user_1',
      eventKeyName: 'camp',
      guestEmail: 'guest@example.com',
      accessToken: createAccessToken(),
      formResponses: submittedResponses,
    })

    expect(result).toEqual({ success: false, error: 'already_submitted' })
    expect(prisma.payment.updateMany).toHaveBeenCalledTimes(1)
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})
