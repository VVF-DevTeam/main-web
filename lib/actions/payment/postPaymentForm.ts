'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/db'
import {
  EventFormData,
  FormQuestion,
  getEventForm,
} from '@/lib/actions/event/getEventForm'
import type { FormResponses } from '@/components/payment/PaymentInfoForm'
import { verifyPostPaymentFormAccessToken } from '@/lib/utils/postPaymentFormAccessToken'

type OtherGuest = { name: string; email: string; phone?: string }

export type FormResponseEntry = {
  questionId: string
  question: string
  answer: string | string[]
  questionType: string
  required: boolean
  options: string[]
  formNumber: number
}

export type SavedFormResponsesBlock = {
  email: string
  responses: FormResponseEntry[]
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function asFormResponseBlocks(
  value: unknown
): SavedFormResponsesBlock[] | null {
  if (!value || !Array.isArray(value)) return null
  return value as SavedFormResponsesBlock[]
}

function isGuestOnPayment(
  payment: { guestEmail: string | null; otherGuests: unknown },
  guestEmail: string
): boolean {
  const normalized = normalizeEmail(guestEmail)

  if (payment.guestEmail && normalizeEmail(payment.guestEmail) === normalized) {
    return true
  }

  const otherGuests = payment.otherGuests as OtherGuest[] | null
  if (!Array.isArray(otherGuests)) return false

  return otherGuests.some(
    (g) => g.email && normalizeEmail(g.email) === normalized
  )
}

function formatFormResponses(
  formResponses: FormResponses,
  eventFormData: EventFormData
): FormResponseEntry[] {
  const allQuestions =
    eventFormData?.flatMap((f) => f.questions) ?? []

  return Object.entries(formResponses).map(([questionId, entry]) => {
    const question = allQuestions.find((q) => q.id === questionId)
    return {
      questionId,
      question: question?.question || '',
      answer: entry.answer,
      questionType: question?.type || '',
      required: question?.required || false,
      options: question?.options || [],
      formNumber: entry.formNumber,
    }
  })
}

function appendFormResponses(
  existing: SavedFormResponsesBlock[] | null,
  newBlock: SavedFormResponsesBlock
): SavedFormResponsesBlock[] {
  if (!existing?.length) return [newBlock]
  return [...existing, newBlock]
}

function guestAlreadySubmitted(
  existing: SavedFormResponsesBlock[] | null,
  guestEmail: string
): boolean {
  if (!existing?.length) return false
  const normalized = normalizeEmail(guestEmail)
  return existing.some(
    (block) => block.email && normalizeEmail(block.email) === normalized
  )
}

const MAX_FORM_RESPONSE_WRITE_RETRIES = 5

export type VerifyPostPaymentFormResult =
  | {
      success: true
      paymentId: string
      eventId: string
      eventTitle: string
      eventFormData: EventFormData
      guestName: string | null
      alreadySubmitted: boolean
    }
  | { success: false; error: string }

export async function verifyPostPaymentFormAccess({
  userId,
  paymentReference,
  eventKeyName,
  guestEmail,
  accessToken,
}: {
  userId?: string | null
  paymentReference?: string | null
  eventKeyName: string
  guestEmail: string
  accessToken?: string | null
}): Promise<VerifyPostPaymentFormResult> {
  const normalizedUserId = userId?.trim() || null
  const normalizedPaymentReference = paymentReference?.trim() || null

  if (
    (!normalizedUserId && !normalizedPaymentReference) ||
    !guestEmail?.trim() ||
    !eventKeyName?.trim()
  ) {
    return { success: false, error: 'missing_params' }
  }

  if (
    !verifyPostPaymentFormAccessToken({
      token: accessToken,
      userId: normalizedUserId,
      paymentReference: normalizedPaymentReference,
      eventKeyName,
      guestEmail,
    })
  ) {
    return { success: false, error: 'missing_params' }
  }

  try {
    const event = await prisma.event.findUnique({
      where: { keyName: eventKeyName },
      select: { id: true, title: true },
    })

    if (!event) {
      return { success: false, error: 'event_not_found' }
    }

    const payments = await prisma.payment.findMany({
      where: {
        eventId: event.id,
        refunded: false,
        ...(normalizedPaymentReference
          ? { stripePaymentId: normalizedPaymentReference }
          : { userId: normalizedUserId }),
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

    if (payments.length === 0) {
      return { success: false, error: 'payment_not_found' }
    }

    const payment = payments.find((p) => isGuestOnPayment(p, guestEmail))

    if (!payment) {
      return { success: false, error: 'guest_not_found' }
    }

    const eventFormData = await getEventForm(event.id)

    if (
      !eventFormData ||
      !eventFormData.some((f) => f.questions.length > 0)
    ) {
      return { success: false, error: 'form_not_configured' }
    }

    const otherGuests = payment.otherGuests as OtherGuest[] | null
    const guestRecord = otherGuests?.find(
      (g) => g.email && normalizeEmail(g.email) === normalizeEmail(guestEmail)
    )

    const guestName =
      guestRecord?.name ||
      (payment.guestEmail &&
      normalizeEmail(payment.guestEmail) === normalizeEmail(guestEmail)
        ? payment.guestName
        : null)

    return {
      success: true,
      paymentId: payment.id,
      eventId: event.id,
      eventTitle: event.title,
      eventFormData,
      guestName,
      alreadySubmitted: guestAlreadySubmitted(
        asFormResponseBlocks(payment.formResponses),
        guestEmail
      ),
    }
  } catch (error) {
    console.error('verifyPostPaymentFormAccess error:', error)
    return { success: false, error: 'server_error' }
  }
}

export type SubmitPostPaymentFormResult =
  | { success: true }
  | { success: false; error: string }

export async function submitPostPaymentForm({
  paymentId,
  userId,
  paymentReference,
  eventKeyName,
  guestEmail,
  accessToken,
  formResponses,
}: {
  paymentId: string
  userId?: string | null
  paymentReference?: string | null
  eventKeyName: string
  guestEmail: string
  accessToken?: string | null
  formResponses: FormResponses
}): Promise<SubmitPostPaymentFormResult> {
  const verification = await verifyPostPaymentFormAccess({
    userId,
    paymentReference,
    eventKeyName,
    guestEmail,
    accessToken,
  })

  if (!verification.success) {
    return { success: false, error: verification.error }
  }

  if (verification.paymentId !== paymentId) {
    return { success: false, error: 'invalid_payment' }
  }

  if (verification.alreadySubmitted) {
    return { success: false, error: 'already_submitted' }
  }

  if (!formResponses || Object.keys(formResponses).length === 0) {
    return { success: false, error: 'empty_form' }
  }

  try {
    const newBlock: SavedFormResponsesBlock = {
      email: normalizeEmail(guestEmail),
      responses: formatFormResponses(
        formResponses,
        verification.eventFormData
      ),
    }

    for (
      let attempt = 0;
      attempt < MAX_FORM_RESPONSE_WRITE_RETRIES;
      attempt++
    ) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        select: { formResponses: true, updatedAt: true },
      })

      if (!payment) {
        return { success: false, error: 'payment_not_found' }
      }

      const existingResponses = asFormResponseBlocks(payment.formResponses)

      if (guestAlreadySubmitted(existingResponses, guestEmail)) {
        return { success: false, error: 'already_submitted' }
      }

      const updatedFormResponses = appendFormResponses(
        existingResponses,
        newBlock
      )

      const updateResult = await prisma.payment.updateMany({
        where: {
          id: paymentId,
          updatedAt: payment.updatedAt,
        },
        data: { formResponses: updatedFormResponses },
      })

      if (updateResult.count === 1) {
        revalidateTag('payments')
        return { success: true }
      }
    }

    return { success: false, error: 'server_error' }
  } catch (error) {
    console.error('submitPostPaymentForm error:', error)
    return { success: false, error: 'server_error' }
  }

  return { success: false, error: 'server_error' }
}
