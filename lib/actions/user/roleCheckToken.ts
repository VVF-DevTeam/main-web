// This roleCheck is for middleware.js to avoid useLayoutEffect mismatch error
import { getToken } from 'next-auth/jwt'
import { Role } from '@prisma/client'
import { NextRequest } from 'next/server'

interface StatusCheckProps {
  role?: Role
  req: NextRequest
}

export async function roleCheckToken({ role, req }: StatusCheckProps) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
  })

  // console.log('Cookies:', req.cookies.getAll())

  if (!token) return false

  if (role) {
    return token.role?.includes(role)
  }

  return token.role && token.role?.length > 0
}