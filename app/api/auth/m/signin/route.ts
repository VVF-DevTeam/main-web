import { NextRequest, NextResponse } from 'next/server'

import { signInSchema } from '@/lib/zodSchema/signinSchema'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/actions/email/sendVerificationEmail'
import { createToken } from '@/lib/actions/token/tokenFunctions'
import * as jose from 'jose'
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit'

interface SignInRequest {
  email: string
  password: string
}

export const POST = async (req: NextRequest) => {
  try {
    const signInRequestData = (await req.json()) as SignInRequest
    const parsedCredentials =
      await signInSchema.safeParseAsync(signInRequestData)

    if (parsedCredentials.error)
      return NextResponse.json(
        { message: 'Email or password is not formatted' },
        { status: 400 }
      )

    const clientIp = getClientIp(req.headers.get('x-forwarded-for'))
    const signinLimit = checkRateLimit({
      key: `m-signin:${clientIp}:${parsedCredentials.data.email.toLowerCase()}`,
      limit: 12,
      windowMs: 2 * 60 * 1000,
    })
    if (!signinLimit.allowed) {
      return NextResponse.json(
        {
          message: `Too many sign-in attempts. Try again in ${signinLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(signinLimit.retryAfterSeconds),
          },
        }
      )
    }

    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: {
        email: parsedCredentials.data.email,
      },
    })

    if (!userExists)
      return NextResponse.json(
        { message: 'Email or password is not corrected' },
        { status: 401 }
      )

    if (!userExists.emailVerifiedDate) {
      const newToken = await createToken(userExists.email)
      sendVerificationEmail({
        firstName: userExists.name!,
        to: userExists.email,
        token: newToken?.id!,
        type: 'accountVerification',
      })

      return NextResponse.json(
        {
          message:
            'Email is not verified, please check your email to verify before sign in',
        },
        { status: 401 }
      )
    }

    if (
      !(await bcrypt.compare(
        parsedCredentials.data.password,
        userExists.password!
      ))
    )
      return NextResponse.json(
        { message: 'Email or password is not corrected' },
        { status: 401 }
      )

    const secretKey = new TextEncoder().encode(
      process.env.AUTH_SECRET as string
    )

    const jwtToken = await new jose.SignJWT({
      id: userExists.id,
      email: userExists.email,
      name: userExists.name,
      image: userExists.image,
      role: userExists.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secretKey)

    return NextResponse.json(
      { type: 'Bearer', token: jwtToken },
      { status: 200 }
    )
  } catch (error) {
    console.log(error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
