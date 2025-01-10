import { z } from 'zod'

export const signUpSchema = z
  .object({
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(2, { message: 'First name must be at least 2 characters long' }),
    lastName: z
      .string({ required_error: 'last name is required' })
      .min(1, { message: 'Last name must be at least 2 characters long' }),
    email: z
      .string({ required_error: 'email is required' })
      .email('Invalid email'),
    age: z
      .string({ required_error: 'age is required' })
      .min(1, { message: 'Invalid age' }),
    phoneNumber: z
      .string({ required_error: 'Phone number is required' })
      .min(10, { message: 'Incomplete phone number' })
      .max(10, { message: 'Invalid phone number' }),
    address: z.string().min(10, { message: 'Incomplete address' }),
    password: z
      .string({ required_error: 'password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z
      .string({ required_error: 'confirm password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
