import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function getCurrentUserInfo() {
  const session = await auth()
  const userEmail = session?.user?.email

  if (!userEmail) return null // No user session available

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) return null // User not found in database

  // Ensure all properties match expected `userProps` type
  return {
    name: user.name ?? '',
    email: user.email, 
    phone: user.phone ?? '',
    address: user.address ?? '',
    age: user.age ?? '',
    image: user.image ?? undefined,
    password: user.password ?? '',
  }
}
