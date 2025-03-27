import NextAuth from 'next-auth'
import authConfig from './auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/((?!api|static|.*\\..*|_next).*)', // all non-api paths excluding static files
    '/api/:path*', // all API routes
  ],
}
