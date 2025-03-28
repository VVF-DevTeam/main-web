import { auth } from '@/auth'
import { Role } from '@prisma/client'
type role = Role

interface StatusCheckProps {
  role?: role
}

export async function roleCheck({ role }: StatusCheckProps) {
  const session = await auth()

  if (role) {
    let matchRole = false
    if (session?.user?.role === role) {
      matchRole = true
    }

    return matchRole
  }

  // return role if param is not provided
  return session?.user?.role
}
