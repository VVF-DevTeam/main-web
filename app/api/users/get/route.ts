import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const GET = async (request: Request) => {
  try {
    const userId = request.headers.get('userId')

    if (!userId)
      return NextResponse.json({ message: 'Un-authorized' }, { status: 401 })

    const user = await prisma.user.findUniqueOrThrow({
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
        phone: true,
        age: true,
        address: true,
        phoneVerified: true,
      },
      where: {
        id: userId,
      },
    })
    return NextResponse.json({ data: user })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}
