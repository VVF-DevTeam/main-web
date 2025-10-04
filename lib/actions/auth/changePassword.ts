'use server'

import { prisma } from '../../db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Define validation schema
const passwordSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  currentPassword: z.string().optional(), // Allow currentPassword to be omitted
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  forgotPassword: z.boolean().optional(),
})

export const changePassword = async (data: { email: string; currentPassword?: string; newPassword: string; forgotPassword?: boolean }) => {
  try {
    // Validate input
    const parsedData = passwordSchema.safeParse(data)
    if (!parsedData.success) {
      const errorMessage = Object.values(parsedData.error.format())
        .flat()
        .join(', ') // Convert validation errors to a readable string

      return { success: false, message: errorMessage }
    }

    const { email, currentPassword, newPassword, forgotPassword } = parsedData.data

    // Fetch user from the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true }, // Only fetch password field
    })

    if (!user) {
      return { success: false, message: "User doesn't exist" }
    }

    // If currentPassword exists in the DB, compare it
    if (user.password && !forgotPassword) {
      if (!currentPassword) {
        return { success: false, message: 'Current password is required' }
      }
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect' }
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in the database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    return { success: true, message: 'Password updated successfully' }
  } catch (error) {
    console.error('Password update error:', error)
    // Ensure we return a proper error message string
    const errorMessage = error instanceof Error ? error.message : 'Failed to update password'
    return { success: false, message: errorMessage }
  }
}
