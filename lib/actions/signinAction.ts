'use server'
import { signIn } from '@/auth'
import { signInSchema } from '../zodSchema/signinSchema'
import { AuthError } from 'next-auth'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { prisma } from '../db'
import { sendEmail } from '../utilFunctions/sendEmail'
import { createToken } from '../dbQueries/token'

export const signinAction = async (data: {
  email: string
  password: string
}) => {
  try {
    const parsedCredentials = signInSchema.safeParse(data)
    if (!parsedCredentials.success) {
      return {
        message: parsedCredentials.error.message,
        success: false,
      }
    }
    const { email, password } = parsedCredentials.data
    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (!userExists || !userExists.password) {
      return {
        message: "User doesn't exist",
        success: false,
      }
    }

    if (!userExists.emailVerified) {
      const newToken = await createToken(email)
      sendEmail({
        firstName: userExists.name!,
        to: userExists.email,
        token: newToken?.id!,
      })

      return {
        message: 'A verification link has been sent to your email',
        success: true,
      }
    }
 
    // Sign in the user
    await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    })

    return {
      message: 'Signed in successfully',
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
    throw error
  }
}
