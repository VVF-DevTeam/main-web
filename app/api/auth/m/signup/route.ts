import { prisma } from '@/lib/db'
import { signUpSchema } from '@/lib/zodSchema/signupSchema'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createToken } from '@/lib/actions/token/tokenFunctions'
import { sendVerificationEmail } from '@/lib/actions/email/sendVerificationEmail'
import { error } from 'console'

interface SignupActionProps {
  firstName: string
  lastName: string
  email: string
  age: string
  phoneNumber: string
  address: string
  password: string
  confirmPassword: string
}

export const POST = async (request: NextRequest) => {
  try {
    const signUpRequestData = (await request.json()) as SignupActionProps

    const parsedCredentials =
      await signUpSchema.safeParseAsync(signUpRequestData)

    if (parsedCredentials.error) {
      console.error(parsedCredentials.error.message)
      return NextResponse.json(
        { message: 'Something is not formatted' },
        { status: 400 }
      )
    }

    if (signUpRequestData.password !== signUpRequestData.confirmPassword)
      return NextResponse.json(
        {
          message: 'Password is not matched',
        },
        { status: 400 }
      )
    const existedUser = await prisma.user.findUnique({
      where: {
        email: parsedCredentials.data.email,
      },
    })

    if (existedUser) {
      return NextResponse.json(
        { message: 'User is already existed' },
        { status: 409 }
      )
    }

    const hashedPassword = bcrypt.hashSync(
      signUpRequestData.password,
      Number(process.env.BCRYPT_SALT)!
    )

    const fullName = `${signUpRequestData.firstName} ${signUpRequestData.lastName}`

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email: signUpRequestData.email,
        age: String(signUpRequestData.age),
        phone: String(signUpRequestData.phoneNumber),
        address: signUpRequestData.address,
        password: hashedPassword,
      },
    })

    const verificationToken = await createToken(user.email)
    if (verificationToken && user) {
      await sendVerificationEmail({
        firstName: user.name!,
        to: user.email,
        token: verificationToken.token,
      })
    }

    return NextResponse.json(
      {
        message:
          'Account created successfully. A verification link has been sent to your email',
      },
      { status: 201 }
    )
  } catch (error) {
    throw error
  }
}
