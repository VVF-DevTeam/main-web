'use server'

import { prisma } from '@/lib/db'
import { createToken } from '../token/tokenFunctions'
import { revalidateTag } from 'next/cache'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '../email/sendVerificationEmail'
import { signUpSchema } from '@/lib/zodSchema/signupSchema'
import { linkGuestPaymentsToUser } from '../payment/linkGuestPayments'
import initTranslation from '@/app/i18n'
import { verifyTurnstileToken } from '@/lib/security/verifyTurnstile'

interface signupActionProps {
  firstName: string
  lastName: string
  email: string
  age: string
  phoneNumber: string
  address: string
  password: string
  confirmPassword: string
  locale?: string
  turnstileToken: string
}
export const signupAction = async (formData: signupActionProps) => {
  try {
    const {
      firstName,
      lastName,
      email,
      age,
      phoneNumber,
      address,
      password,
      confirmPassword,
      locale,
      turnstileToken,
    } = formData

    const turnstileResult = await verifyTurnstileToken(turnstileToken)
    if (!turnstileResult.ok) {
      return {
        message: 'Captcha verification failed',
        success: false,
      }
    }

    // CHECK IF THE INPUT IS VALID
    const validInput = signUpSchema.safeParse(formData)
    if (!validInput.success) {
      return {
        message: 'Invalid form data',
        success: false,
      }
    }

    // CHECK IF THE PASSWORDS MATCH

    if (password !== confirmPassword) {
      return {
        message: 'Passwords do not match',
        success: false,
      }
    }
    // CHECK IF THE USER ALREADY EXISTS
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          { phone: phoneNumber },
        ],
      },
    })

    if (existingUser) {
      // Get translated message
      const currentLocale = locale || 'en'
      const { t } = await initTranslation(currentLocale, ['signIn-signUp'])
      
      return {
        message: t('account-already-exists'),
        success: false,
      }
    }
    // CREATE THE USER
    const hashedPassword = bcrypt.hashSync(
      password,
      Number(process.env.BCRYPT_SALT)!
    )
    const fullName = firstName + ' ' + lastName
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: email,
        age: String(age),
        phone: String(phoneNumber),
        address: address,
        password: hashedPassword,
        role: ['USER'],
      },
    })

    // Send Verification Email
    const verificationToken = await createToken(user.email)
    if (verificationToken && user) {
      await sendVerificationEmail({
        firstName: user.name!,
        to: user.email,
        token: verificationToken.token,
        type: 'accountVerification',
      })
    }

    // Revalidate users cache
    revalidateTag('users')

    // Link any guest payments made with this email to the new user account
    try {
      const linkResult = await linkGuestPaymentsToUser(user.id, user.email)
      if (linkResult.linkedCount > 0) {
        console.log(
          `[SIGNUP] Linked ${linkResult.linkedCount} guest payment(s) to new user account`
        )
      }
    } catch (linkError) {
      // Log error but don't fail signup if linking fails
      console.error('[SIGNUP] Failed to link guest payments:', linkError)
    }

    // Get translated message
    const currentLocale = locale || 'en'
    const { t } = await initTranslation(currentLocale, ['signIn-signUp'])

    return {
      message: t('account-created-success'),
      success: true,
    }
  } catch (error) {
    throw error
  }
}
