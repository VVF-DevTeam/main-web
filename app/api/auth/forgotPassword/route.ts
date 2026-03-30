import { sendVerificationEmail } from '@/lib/actions/email/sendVerificationEmail'
import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { createToken } from '@/lib/actions/token/tokenFunctions'
import { verifyTurnstileToken } from '@/lib/security/verifyTurnstile'

export const POST = async (req: NextRequest) => {
  try {
    const { email, turnstileToken } = await req.json()
    const turnstileResult = await verifyTurnstileToken(turnstileToken)
    if (!turnstileResult.ok) {
      return NextResponse.json(
        { message: 'Captcha verification failed' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return NextResponse.json(
        { message: 'If this email exists, a reset link will be sent.' },
        { status: 200 }
      )
    }
    const verificationToken = await createToken(user.email)
    await sendVerificationEmail({
      firstName: user.name!,
      to: user.email,
      token: verificationToken?.token!,
      type: 'forgotPassword',
    })
    
    return NextResponse.json(
      { message: 'If this email exists, a reset link will be sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending forgot password email:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
