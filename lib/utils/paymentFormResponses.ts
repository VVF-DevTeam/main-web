export type StoredFormResponseEntry = {
  questionId: string
  question: string
  answer: string | string[]
  questionType: string
  required: boolean
  options: string[]
  formNumber?: number
}

export type StoredFormResponsesBlock = {
  email: string
  responses: StoredFormResponseEntry[]
}

type LegacyStoredFormResponses = {
  responses: StoredFormResponseEntry[]
}

function isStoredFormResponsesBlock(
  value: unknown
): value is StoredFormResponsesBlock {
  return Boolean(
    value &&
      typeof value === 'object' &&
      Array.isArray((value as StoredFormResponsesBlock).responses)
  )
}

export function normalizeStoredFormResponses(
  value: unknown
): StoredFormResponsesBlock[] | null {
  if (!value) return null

  if (Array.isArray(value)) {
    const blocks = value
      .filter(isStoredFormResponsesBlock)
      .map((block) => ({
        email: typeof block.email === 'string' ? block.email.trim() : '',
        responses: block.responses,
      }))

    return blocks.length > 0 ? blocks : null
  }

  if (
    typeof value === 'object' &&
    Array.isArray((value as LegacyStoredFormResponses).responses)
  ) {
    return [
      {
        email: '',
        responses: (value as LegacyStoredFormResponses).responses,
      },
    ]
  }

  return null
}
