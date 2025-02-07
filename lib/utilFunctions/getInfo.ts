import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function getInfo() {
  const session = await auth()
  const userEmail = session?.user?.email

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail || '',
    },
  })

  return user
}
