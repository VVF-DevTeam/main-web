'use server'
import { signIn } from '@/auth'
import { signInSchema } from '@/lib/zodSchema/signinSchema'
import { AuthError } from 'next-auth'
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from '@/lib/db'
import initTranslation from '@/app/i18n'
import { verifyTurnstileToken } from '@/lib/security/verifyTurnstile'

export const signinAction = async (data: {
  email: string
  password: string
  locale?: string
  turnstileToken: string
}) => {
  // Get translated message once at the top
  const currentLocale = data.locale || 'en'
  const { t } = await initTranslation(currentLocale, ['signIn-signUp'])
  
  try {
    const turnstileResult = await verifyTurnstileToken(data.turnstileToken)
    if (!turnstileResult.ok) {
      return {
        message: 'Too many attempts tried in short period of time. Please wait a moment and try again.',
        success: false,
      }
    }

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
        message: t('user-doesnt-exist'),
        success: false,
      }
    }
    

    // We will let the user sign in first and verify later
    // if (!userExists.emailVerified) {
    //   const newToken = await createToken(email)
    //   sendVerificationEmail({
    //     firstName: userExists.name!,
    //     to: userExists.email,
    //     token: newToken?.id!,
    //     type: 'accountVerification',
    //   })

    //   return {
    //     message: 'Please verify your account first. A new verification link has been sent to your email',
    //     success: false,
    //   }
    // }

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
            message: t('incorrect-password'),
            success: false,
          }
        }
        case 'CallbackRouteError': {
          const errorMessage = error.cause?.err?.toString() || ''
          
          // Check if it's the incorrect password error
          if (errorMessage.includes('Incorrect password')) {
            return {
              message: t('incorrect-password'),
              success: false,
            }
          }
          
          // Check if it's the user doesn't exist error
          if (errorMessage.includes('User does not exist')) {
            return {
              message: t('user-doesnt-exist'),
              success: false,
            }
          }
          
          // Default error message
          return {
            message: errorMessage || t('unexpected-error'),
            success: false,
          }
        }
        default: {
          return {
            message: t('unexpected-error'),
            success: false,
          }
        }
      }
    }
    throw error
  }
}
