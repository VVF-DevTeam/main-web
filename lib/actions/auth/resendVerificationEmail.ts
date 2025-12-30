'use server'

import { prisma } from '@/lib/db'
import { createToken } from '../token/tokenFunctions'
import { sendVerificationEmail } from '../email/sendVerificationEmail'

export async function resendVerificationEmailAction(email: string) {
  try {
    if (!email) {
      return {
        message: 'You must be logged in to resend verification email',
        success: false,
      }
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: email },
    })

    if (!user) {
      return {
        message: 'User not found',
        success: false,
      }
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return {
        message: 'Your email is already verified',
        success: false,
      }
    }

    // Create a new verification token
    const verificationToken = await createToken(user.email)

    if (!verificationToken) {
      return {
        message: 'Failed to create verification token',
        success: false,
      }
    }

    // Send verification email
    await sendVerificationEmail({
      firstName: user.name || 'User',
      to: user.email,
      token: verificationToken.token,
      type: 'accountVerification',
    })

    return {
      message: 'Verification email sent successfully. Please check your inbox.',
      success: true,
    }
  } catch (error) {
    console.error('Error resending verification email:', error)
    return {
      message: 'An error occurred while sending the verification email',
      success: false,
    }
  }
}

