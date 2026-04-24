import { getTokenByToken } from '@/lib/actions/token/tokenFunctions'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const { token, email } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ message: 'Invalid token.' }, { status: 400 })
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Invalid email.' }, { status: 400 })
    }

    const tokenRecord = await getTokenByToken(token)
    if (!tokenRecord) {
      return NextResponse.json(
        { message: 'Token does not exist or has already been used.' },
        { status: 400 }
      )
    }

    if (tokenRecord.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { message: 'Token and email do not match.' },
        { status: 400 }
      )
    }

    if (new Date(tokenRecord.expires) < new Date()) {
      return NextResponse.json(
        { message: 'Token is invalid or has expired.' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { email: tokenRecord.email },
      data: {
        // Persist verification completion in an existing stable field.
        emailVerified: new Date(),
      },
    })

    await prisma.verificationToken.delete({
      where: { id: tokenRecord.id },
    })

    return NextResponse.json(
      { message: 'Student verification completed successfully.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error confirming student verification:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
