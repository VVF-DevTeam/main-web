import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export const PUT = async (request: NextRequest) => {
  try {
    const userId = request.headers.get('userId') as string
    const { name, age, phone, address, image } = await request.json()
    const savedUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? savedUser.name,
        age: age ?? savedUser.age,
        phone: phone ?? savedUser.phone,
        address: address ?? savedUser.address,
        image: image ?? savedUser.image,
      },
    })

    // Revalidate users cache
    revalidateTag('users')

    // console.log(updatedUser)
    return NextResponse.json({ data: updatedUser }, { status: 200 })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined
        if (target?.includes('phone')) {
          return NextResponse.json(
            { message: 'This phone number is already in use', code: 'P2002' },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { message: 'A unique constraint violation occurred', code: 'P2002' },
          { status: 409 }
        )
      }
    }
    console.log(error)
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}