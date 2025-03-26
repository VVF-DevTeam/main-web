import { auth } from '@/auth'
import { prisma } from '@/lib/db'

type role = 'ADMIN' | 'HOST'

interface StatusCheckProps {
  role: role
}

export async function roleCheck({ role }: StatusCheckProps) {
  const session = await auth()
  const userEmail = session?.user?.email

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail || '',
    },
  })

  let isAdmin = false
  if (user?.role === role) {
    isAdmin = true
  }

  return isAdmin
}
