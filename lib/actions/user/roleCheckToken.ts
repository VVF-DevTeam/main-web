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
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  })

  console.log('Cookies:', req.cookies.getAll())

  console.log(token)
  console.log(process.env.AUTH_SECRET)
  if (!token) return false

  if (role) {
    return token.role === role
  }

  return token.role
}