import { createToken } from '@/lib/actions/token/tokenFunctions'
import { sendVerificationEmail } from '@/lib/actions/email/sendVerificationEmail'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { email, schoolName } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Student email is required.' },
        { status: 400 }
      )
    }

    if (!schoolName || typeof schoolName !== 'string') {
      return NextResponse.json(
        { message: 'School name is required.' },
        { status: 400 }
      )
    }

    const clientIp = getClientIp(req.headers.get('x-forwarded-for'))
    const verificationLimit = checkRateLimit({
      key: `student-verify:${clientIp}:${email.toLowerCase()}`,
      limit: 5,
      windowMs: 60 * 1000,
    })

    if (!verificationLimit.allowed) {
      return NextResponse.json(
        {
          message: `Too many verification attempts. Try again in ${verificationLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(verificationLimit.retryAfterSeconds),
          },
        }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Keep response generic to avoid email enumeration.
    if (!user) {
      return NextResponse.json(
        { message: 'If this email exists, a verification link will be sent.' },
        { status: 200 }
      )
    }

    const verificationToken = await createToken(user.email)
    if (!verificationToken) {
      return NextResponse.json(
        { message: 'Could not create verification token.' },
        { status: 500 }
      )
    }

    await sendVerificationEmail({
      firstName: user.name || schoolName,
      to: user.email,
      token: verificationToken.token,
      type: 'studentVerification',
    })

    return NextResponse.json(
      { message: 'If this email exists, a verification link will be sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending student verification email:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
