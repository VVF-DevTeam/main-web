import { ReviewRating } from '@prisma/client'

/**
 * Universal rating conversion utilities
 * These functions can be used both client-side and server-side
 */

// Convert string to ReviewRating enum
export const convertStringToReviewRating = (rating: string): ReviewRating | undefined => {
  switch (rating) {
    case '1':
      return ReviewRating.One
    case '2':
      return ReviewRating.Two
    case '3':
      return ReviewRating.Three
    case '4':
      return ReviewRating.Four
    case '5':
      return ReviewRating.Five
    default:
      return undefined
  }
}

// Convert ReviewRating enum to number
export const convertReviewRatingToNumber = (rating: ReviewRating): number => {
  switch (rating) {
    case ReviewRating.One:
      return 1
    case ReviewRating.Two:
      return 2
    case ReviewRating.Three:
      return 3
    case ReviewRating.Four:
      return 4
    case ReviewRating.Five:
      return 5
    default:
      return 0
  }
}

// Convert number to ReviewRating enum
export const convertNumberToReviewRating = (rating: number): ReviewRating | undefined => {
  switch (rating) {
    case 1:
      return ReviewRating.One
    case 2:
      return ReviewRating.Two
    case 3:
      return ReviewRating.Three
    case 4:
      return ReviewRating.Four
    case 5:
      return ReviewRating.Five
    default:
      return undefined
  }
}

// Convert ReviewRating enum to string
export const convertReviewRatingToString = (rating: ReviewRating): string => {
  switch (rating) {
    case ReviewRating.One:
      return '1'
    case ReviewRating.Two:
      return '2'
    case ReviewRating.Three:
      return '3'
    case ReviewRating.Four:
      return '4'
    case ReviewRating.Five:
      return '5'
    default:
      return '0'
  }
}

// Rating mapping object for quick lookups
export const RATING_MAP = {
  '1': ReviewRating.One,
  '2': ReviewRating.Two,
  '3': ReviewRating.Three,
  '4': ReviewRating.Four,
  '5': ReviewRating.Five,
} as const

// Reverse rating mapping (enum to string)
export const REVERSE_RATING_MAP = {
  [ReviewRating.One]: '1',
  [ReviewRating.Two]: '2',
  [ReviewRating.Three]: '3',
  [ReviewRating.Four]: '4',
  [ReviewRating.Five]: '5',
} as const

// Number to enum mapping
export const NUMBER_TO_RATING_MAP = {
  1: ReviewRating.One,
  2: ReviewRating.Two,
  3: ReviewRating.Three,
  4: ReviewRating.Four,
  5: ReviewRating.Five,
} as const

/**
 * Usage Examples:
 * 
 * // Convert string to enum
 * const rating = convertStringToReviewRating('5') // ReviewRating.Five
 * 
 * // Convert enum to number
 * const number = convertReviewRatingToNumber(ReviewRating.Five) // 5
 * 
 * // Convert number to enum
 * const enumValue = convertNumberToReviewRating(5) // ReviewRating.Five
 * 
 * // Convert enum to string
 * const string = convertReviewRatingToString(ReviewRating.Five) // '5'
 * 
 * // Quick lookups
 * const rating = RATING_MAP['5'] // ReviewRating.Five
 * const number = NUMBER_TO_RATING_MAP[5] // ReviewRating.Five
 */
