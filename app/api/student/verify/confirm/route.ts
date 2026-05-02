import { getTokenByToken } from '@/lib/actions/token/tokenFunctions'
import { auth, unstable_update } from '@/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth()
    const sessionEmail = session?.user?.email
    if (!sessionEmail) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 })
    }

    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ message: 'Invalid token.' }, { status: 400 })
    }

    const tokenRecord = await getTokenByToken(token)
    if (!tokenRecord) {
      return NextResponse.json(
        { message: 'Token does not exist or has already been used.' },
        { status: 400 }
      )
    }

    if (tokenRecord.email.toLowerCase() !== sessionEmail.toLowerCase()) {
      return NextResponse.json(
        { message: 'Token and current account do not match.' },
        { status: 403 }
      )
    }

    if (!tokenRecord.pendingEduEmail) {
      return NextResponse.json(
        { message: 'Token is invalid for student verification.' },
        { status: 400 }
      )
    }

    if (new Date(tokenRecord.expires) < new Date()) {
      return NextResponse.json(
        { message: 'Token is invalid or has expired.' },
        { status: 400 }
      )
    }

    const verifiedDate = new Date()
    const expireDate = new Date(verifiedDate.getTime() + 365 * 24 * 3600 * 1000)

    await prisma.$transaction([
      prisma.user.update({
        where: { email: tokenRecord.email },
        data: {
          eduEmailVerifiedDate: verifiedDate,
          eduEmailExpiredDate: expireDate,
          eduEmail: tokenRecord.pendingEduEmail,
        },
      }),
      prisma.verificationToken.delete({
        where: { id: tokenRecord.id },
      }),
    ])

    await unstable_update({
      user: {
        eduEmailExpiredDate: expireDate,
      },
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
