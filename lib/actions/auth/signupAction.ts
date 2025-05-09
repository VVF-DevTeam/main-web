'use server'

import { prisma } from '@/lib/db'
import { createToken } from '../token/tokenFunctions'

import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '../email/sendVerificationEmail'
import { signUpSchema } from '@/lib/zodSchema/signupSchema'

interface signupActionProps {
  firstName: string
  lastName: string
  email: string
  age: string
  phoneNumber: string
  address: string
  password: string
  confirmPassword: string
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
    } = formData

    // CHECK IF THE INPUT IS VALID
    const validInput = signUpSchema.safeParse(formData)
    if (!validInput.success) {
      return {
        message: 'Invalid form data',
        success: false,
      }
    }
    console.log('Before checking password')

    // CHECK IF THE PASSWORDS MATCH

    if (password !== confirmPassword) {
      return {
        message: 'Passwords do not match',
        success: false,
      }
    }
    console.log('Before checking user')
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
      return {
        message: 'An account with this email or phone number exists',
        success: false,
      }
    }
    console.log('Before creating user')
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

    console.log('After creating user')

    // Send Verification Email
    const verificationToken = await createToken(user.email)
    if (verificationToken && user) {
      await sendVerificationEmail({
        firstName: user.name!,
        to: user.email,
        token: verificationToken.token,
      })
    }

    return {
      message:
        'Account created successfully. A verification link has been sent to your email',
      success: true,
    }
  } catch (error) {
    throw error
  }
}
