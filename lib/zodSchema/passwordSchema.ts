import { z } from 'zod'

export const passwordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string({ required_error: 'New Password is required' })
      .min(1, { message: 'New Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' }),
    repeatPassword: z
      .string({ required_error: 'Repeat Password is required' })
      .min(1, { message: 'Repeat Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'], // Assign error to newPassword field
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: "Passwords don't match",
    path: ['repeatPassword'],
  })