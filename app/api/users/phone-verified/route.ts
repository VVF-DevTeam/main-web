import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, phoneVerified } = await request.json()
    if (!userId || typeof phoneVerified !== 'boolean') {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}