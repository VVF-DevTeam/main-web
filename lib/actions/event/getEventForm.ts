'use server'

import { unstable_cache } from 'next/cache'
import { withDbRetry } from '@/lib/db/withDbRetry'

export type FormQuestionCondition = {
  numberOperator?: 'eq' | 'lt' | 'gt'
  numberValue?: number
  selectedChoices?: string[]
  matchMode?: 'any' | 'all'
}

export type FormQuestion = {
  id: string
  question: string
  description?: string
  type: 'short_text' | 'long_text' | 'number' | 'single_choice' | 'multi_choice' | 'date'
  required: boolean
  options?: string[]
  // 1-based index of the form the question belongs to (saved in EventForm JSON).
  // Used when constructing checkout `formResponses`.
  formNumber?: number
  linkedQuestionId?: string
  condition?: FormQuestionCondition
}

/** Stored format: array of form objects — [ { questions: [...] }, ... ] */
export type EventFormData = Array<{ questions: FormQuestion[] }> | null

/**
 * Get the form definition for an event (cached for 7 days)
 * Returns the FormData JSON from the EventForm table
 */
export const getEventForm = unstable_cache(
  async (eventId: string): Promise<EventFormData> => {
    const { prisma } = await import('@/lib/db')
    return withDbRetry(async () => {
      const eventForm = await prisma.eventForm.findFirst({
        where: { eventId },
      })

      return eventForm?.FormData as EventFormData
    }, { label: 'getEventForm' })
  },
  ['event-form'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (7 * 24 * 60 * 60 seconds)
    tags: ['events'], // Tag for revalidation - same as used in the API route
  }
)
