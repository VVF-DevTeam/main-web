import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function adminCheck() {
  const session = await auth()
  const userEmail = session?.user?.email

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail || '',
    },
  })

  let isAdmin = false
  if (user?.role === 'ADMIN') {
    isAdmin = true
  }

  return isAdmin
}
