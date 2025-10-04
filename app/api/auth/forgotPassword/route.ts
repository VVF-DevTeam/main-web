import { sendVerificationEmail } from '@/lib/actions/email/sendVerificationEmail'
import { prisma } from '@/lib/db'
import { NextResponse, NextRequest } from 'next/server'
import { createToken } from '@/lib/actions/token/tokenFunctions'

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json()
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (!user) {
      return NextResponse.json({ message: 'User with that email not found' }, { status: 404 })
    }
    const verificationToken = await createToken(user.email)
    await sendVerificationEmail({
      firstName: user.name!,
      to: user.email,
      token: verificationToken?.token!,
      type: 'forgotPassword',
    })
    
    return NextResponse.json({ message: 'Password reset email sent successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error sending forgot password email:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
