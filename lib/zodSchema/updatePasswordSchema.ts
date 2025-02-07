import { z } from 'zod'


export const passwordUpdateSchema = z.object({
    email: z.string().email(),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
  })