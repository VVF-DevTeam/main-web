'use server'

import { unstable_cache } from 'next/cache'

// Type definition for the form data structure
export type EventFormData = {
  questions: Array<{
    id: string // Required - generated with nanoid(10)
    question: string
    description?: string
    type: 'short_text' | 'long_text' | 'number' | 'single_choice' | 'multi_choice' | 'date'
    required: boolean
    options?: string[]
  }>
} | null

/**
 * Get the form definition for an event (cached for 7 days)
 * Returns the FormData JSON from the EventForm table
 */
export const getEventForm = unstable_cache(
  async (eventId: string): Promise<EventFormData> => {
    const { prisma } = await import('@/lib/db')
    try {
      const eventForm = await prisma.eventForm.findFirst({
        where: { eventId },
      })

      return eventForm?.FormData as EventFormData
    } catch (error) {
      console.error('Error getting event form:', error)
      return null
    }
  },
  ['event-form'], // Cache key prefix
  {
    revalidate: 604800, // Cache for 7 days (7 * 24 * 60 * 60 seconds)
    tags: ['events'], // Tag for revalidation - same as used in the API route
  }
)

