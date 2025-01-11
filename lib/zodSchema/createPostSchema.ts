import { z } from 'zod'

export const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, { message: 'Title is required' })
    .max(200, { message: 'Title must be at most 200 characters long' }),
})
