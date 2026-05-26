import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockReset } from 'vitest-mock-extended'
import { prisma } from '@/lib/__mocks__/db'
import { getEventForm } from '@/lib/actions/event/getEventForm'
import { revalidateTag } from 'next/cache'
import {
  submitPostPaymentForm,
  verifyPostPaymentFormAccess,
} from './postPaymentForm'

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma,
}))

vi.mock('@/lib/actions/event/getEventForm', () => ({
  __esModule: true,
  getEventForm: vi.fn(),
}))

vi.mock('next/cache', () => ({
  __esModule: true,
  revalidateTag: vi.fn(),
}))

const mockGetEventForm = vi.mocked(getEventForm)
const mockRevalidateTag = vi.mocked(revalidateTag)

const eventFormData = [
  {
    id: 'form_1',
    questions: [
      {
        id: 'question_1',
        question: 'Meal preference',
        type: 'ShortText',
        required: true,
        options: [],
      },
    ],
  },
] as any

beforeEach(() => {
  mockReset(prisma)
  vi.clearAllMocks()
  mockGetEventForm.mockResolvedValue(eventFormData)
  ;(prisma.$transaction as any).mockImplementation(async (callback: any) =>
    callback(prisma as any)
  )
})

describe('postPaymentForm actions', () => {
  test('verifies guest access using paymentReference when no userId exists', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event_1',
      title: 'Camp registration',
    } as any)
    prisma.payment.findMany.mockResolvedValue([
      {
        id: 'payment_1',
        guestEmail: 'buyer@example.com',
        guestName: 'Buyer',
        otherGuests: [
          {
            name: 'Guest One',
            email: 'guest.one@example.com',
          },
        ],
        formResponses: null,
      },
    ] as any)

    const result = await verifyPostPaymentFormAccess({
      paymentReference: 'pi_123',
      eventKeyName: 'camp-registration',
      guestEmail: 'guest.one@example.com',
    })

    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          eventId: 'event_1',
          refunded: false,
          stripePaymentId: 'pi_123',
        }),
      })
    )
    expect(result).toMatchObject({
      success: true,
      paymentId: 'payment_1',
      guestName: 'Guest One',
      alreadySubmitted: false,
    })
  })

  test('appends form responses in a transaction and revalidates payments', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event_1',
      title: 'Camp registration',
    } as any)
    prisma.payment.findMany.mockResolvedValue([
      {
        id: 'payment_1',
        guestEmail: 'buyer@example.com',
        guestName: 'Buyer',
        otherGuests: [
          {
            name: 'Guest Two',
            email: 'guest.two@example.com',
          },
        ],
        formResponses: [
          {
            email: 'buyer@example.com',
            responses: [],
          },
        ],
      },
    ] as any)
    prisma.$queryRaw.mockResolvedValue([{ id: 'payment_1' }] as any)
    prisma.payment.findUnique.mockResolvedValue({
      formResponses: [
        {
          email: 'buyer@example.com',
          responses: [],
        },
      ],
    } as any)
    prisma.payment.update.mockResolvedValue({ id: 'payment_1' } as any)

    const result = await submitPostPaymentForm({
      paymentId: 'payment_1',
      paymentReference: 'pi_123',
      eventKeyName: 'camp-registration',
      guestEmail: 'guest.two@example.com',
      formResponses: {
        question_1: {
          answer: 'Vegetarian',
          formNumber: 1,
        },
      },
    } as any)

    expect(result).toEqual({ success: true })
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'payment_1' },
        data: {
          formResponses: [
            {
              email: 'buyer@example.com',
              responses: [],
            },
            {
              email: 'guest.two@example.com',
              responses: [
                expect.objectContaining({
                  questionId: 'question_1',
                  answer: 'Vegetarian',
                }),
              ],
            },
          ],
        },
      })
    )
    expect(mockRevalidateTag).toHaveBeenCalledWith('payments')
  })

  test('re-checks already-submitted status after acquiring the payment row lock', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event_1',
      title: 'Camp registration',
    } as any)
    prisma.payment.findMany.mockResolvedValue([
      {
        id: 'payment_1',
        guestEmail: 'buyer@example.com',
        guestName: 'Buyer',
        otherGuests: [
          {
            name: 'Guest Two',
            email: 'guest.two@example.com',
          },
        ],
        formResponses: null,
      },
    ] as any)
    prisma.$queryRaw.mockResolvedValue([{ id: 'payment_1' }] as any)
    prisma.payment.findUnique.mockResolvedValue({
      formResponses: [
        {
          email: 'guest.two@example.com',
          responses: [],
        },
      ],
    } as any)

    const result = await submitPostPaymentForm({
      paymentId: 'payment_1',
      paymentReference: 'pi_123',
      eventKeyName: 'camp-registration',
      guestEmail: 'guest.two@example.com',
      formResponses: {
        question_1: {
          answer: 'Vegetarian',
          formNumber: 1,
        },
      },
    } as any)

    expect(result).toEqual({ success: false, error: 'already_submitted' })
    expect(prisma.payment.update).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})
