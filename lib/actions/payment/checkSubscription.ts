"use server"
import { prisma } from '@/lib/db'

export async function checkSubscription(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        subscribedAt: true,
        subscribeExpires: true,
      },
    })

    if (!user || !user.subscribedAt || !user.subscribeExpires) {
      return false
    }

    const now = new Date()
    return now >= user.subscribedAt && now <= user.subscribeExpires
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}
