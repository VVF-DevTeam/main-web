import NextAuth from 'next-auth'
import authConfig  from './auth.config'
import { auth } from './auth'
import { i18nRouter} from 'next-i18n-router'
import i18nConfig from './i18nConfig'
import { NextRequest } from 'next/server';

export const { auth: nextAuthMiddleware } = NextAuth(authConfig)

export default auth((req) => {
    console.log(req)
    // if (!req.auth && req.nextUrl.pathname !== "/login") {
    //   const newUrl = new URL("/login", req.nextUrl.origin)
    //   return Response.redirect(newUrl)
    // }
  })

export const config = {
   matcher: '/((?!api|static|.*\\..*|_next).*)'
}

export function middleware(req: NextRequest) {
  return i18nRouter(req, i18nConfig); // For translations
}