import { auth } from '@/auth'
import { Role } from '@prisma/client'
type role = Role

interface StatusCheckProps {
  role: role
}

export async function roleCheck({ role }: StatusCheckProps) {
  const session = await auth()

  let isAdmin = false
  if (session?.user?.role === role) {
    isAdmin = true
  }

  return isAdmin
}
