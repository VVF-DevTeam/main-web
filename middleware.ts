import NextAuth from 'next-auth'
import authConfig  from './auth.config'
import { auth } from './auth'

export const { auth: middleware } = NextAuth(authConfig)

export default auth((req) => {
    console.log("middleware")
    // if (!req.auth && req.nextUrl.pathname !== "/login") {
    //   const newUrl = new URL("/login", req.nextUrl.origin)
    //   return Response.redirect(newUrl)
    // }
  })

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
      ],
}

