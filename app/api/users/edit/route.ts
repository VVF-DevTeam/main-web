import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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
    console.log(updatedUser)
    return NextResponse.json({ data: updatedUser }, { status: 200 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 })
  }
}
