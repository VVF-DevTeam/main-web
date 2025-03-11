'use server'

import { prisma } from '../db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Define validation schema
const deleteUserSchema = z.object({
    email: z.string(),
    password: z.string(), // Allow currentPassword to be omitted
  })

export const deleteUser = async (data: { email: string; password: string | null }) => {
  try {
    // Validate input data using Zod schema
    const parsedData = deleteUserSchema.safeParse(data)
    if (!parsedData.success) {
      const errorMessage = Object.values(parsedData.error.format())
        .flat()
        .join(', ')

      return { success: false, message: errorMessage }
    }

    const { email, password } = parsedData.data

    // Fetch user from the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true }, // Fetch only the password field
    })

    if (!user) {
      return { success: false, message: "User doesn't exist" }
    }

    // If user has a password stored, verify it
    if (user.password) {
      if (!password) {
        return { success: false, message: 'Password is required for deletion' }
      }
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return { success: false, message: 'Incorrect password' }
      }
    }

    // Delete the user if password is correct
    await prisma.user.delete({
      where: { email },
    })

    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.error('Error in deleteAction:', error)

    return {
      success: false,
      message: 'An unexpected error occurred while deleting the user',
    }
  }
}
