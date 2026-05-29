import { describe, expect, test } from 'vitest'
import { normalizeStoredFormResponses } from './paymentFormResponses'

describe('normalizeStoredFormResponses', () => {
  test('preserves the current array-of-blocks storage format', () => {
    const value = [
      {
        email: 'guest@example.com',
        responses: [
          {
            questionId: 'q1',
            question: 'Your name',
            answer: 'Guest',
            questionType: 'text',
            required: true,
            options: [],
            formNumber: 1,
          },
        ],
      },
    ]

    expect(normalizeStoredFormResponses(value)).toEqual(value)
  })

  test('normalizes the legacy single responses object for backward compatibility', () => {
    const legacyValue = {
      responses: [
        {
          questionId: 'q1',
          question: 'Your name',
          answer: 'Legacy Guest',
          questionType: 'text',
          required: true,
          options: [],
          formNumber: 1,
        },
      ],
    }

    expect(normalizeStoredFormResponses(legacyValue)).toEqual([
      {
        email: '',
        responses: legacyValue.responses,
      },
    ])
  })
})
