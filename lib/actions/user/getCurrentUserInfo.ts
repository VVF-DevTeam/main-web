'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { UserInfoProps } from '@/lib/types/userInfo'

export async function getCurrentUserInfo() : Promise<UserInfoProps | null> {
  const session = await auth()
  const userEmail = session?.user?.email

  if (!userEmail) return null // No user session available

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) return null // User not found in database

  // Ensure all properties match expected `userProps` type
  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email, 
    phone: user.phone ?? '',
    address: user.address ?? '',
    age: user.age ?? '',
    image: user.image ?? undefined,
    password: user.password ?? '',
    subscribedAt: user.subscribedAt ?? null,
    subscribeExpires: user.subscribeExpires ?? null,
    stripeSubscriptionId: user.stripeSubscriptionId ?? null,
    role: user.role ?? [],
    phoneVerified: user.phoneVerified ?? null,
    emailVerified: user.emailVerified ?? null,
  }
}
