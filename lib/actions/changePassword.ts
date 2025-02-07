'use server'

import { AuthError } from 'next-auth'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { prisma } from '../db'
import bcrypt from 'bcryptjs'

import { passwordUpdateSchema } from '../zodSchema/updatePasswordSchema'


export const changePassword = async (data: {
  email: string
  currentPassword: string
  newPassword: string
}) => {
  try {
    // Validate input data
    const parsedData = passwordUpdateSchema.safeParse(data)
    if (!parsedData.success) {
      return {
        message: parsedData.error.message,
        success: false,
      }
    }
    const { email, currentPassword, newPassword } = parsedData.data
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (!user || !user.password) {
      return {
        message: "User doesn't exist",
        success: false,
      }
    }

    // Compare entered password with stored hashed password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)

    if (!isValidPassword) {
        return {
            message: 'Current password is incorrect',
            success: false,
        }
    }   

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedPassword,
      },
    })

    return {
      message: 'Password updated successfully',
      success: true,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin': {
          return {
            message: 'Invalid credentials',
            success: false,
          }
        }
        case 'CallbackRouteError': {
          return {
            message: error.cause?.err?.toString() || 'Something went wrong',
            success: false,
          }
        }
        default: {
          return {
            message: 'Something went wrong',
            success: false,
          }
        }
      }
    }
    
    console.error('Password update error:', error)
    return {
      message: 'Failed to update password',
      success: false,
    }
  }
}