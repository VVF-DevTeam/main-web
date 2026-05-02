'use server'
import { getTokenByToken } from './tokenFunctions'
import { prisma } from '@/lib/db'

export const verifyToken = async (token: string) => {
  try {
    const tokenExists = await getTokenByToken(token)
    if (!tokenExists) {
      return {
        message: 'Token does not exist',
        success: false,
      }
    }
    const tokenDate = new Date(tokenExists.expires)

    if (tokenDate < new Date()) {
      return {
        message: 'Token is invalid or has expired',
        success: false,
      }
    }
    await prisma.user.update({
      where: {
        email: tokenExists.email,
      },
      data: {
        emailVerifiedDate: new Date(),
      },
    })
    await prisma.verificationToken.delete({
      where: {
        id: tokenExists.id,
      },
    })

    return {
      message: 'Token is valid',
      success: true,
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'Error verifying token',
      success: false,
    }
  }
}
