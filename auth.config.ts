import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { NextAuthConfig } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import { NextResponse } from 'next/server'
import { roleCheckToken } from './lib/actions/user/roleCheckToken'

import { prisma } from './lib/db'
import { PRIVATE_PATHS } from './lib/appRoutes'
import { AUTH_PATHS } from './lib/appRoutes'

import { i18nRouter } from 'next-i18n-router'
import i18nConfig from './i18nConfig'
import { validateSecretToken } from './lib/actions/token/secretToken'

export default {
  providers: [
    Github({
      clientId: process.env.GITHUB_TEST_CLIENT,
      clientSecret: process.env.GITHUB_TEST_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { name: 'email', type: 'email', placeholder: 'email' },
        password: {
          name: 'password',
          type: 'password',
          placeholder: 'password',
        },
      },
      authorize: async (credentials) => {
        let user = null
        // Find user
        user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        })
        //   Check if user exists
        if (!user) {
          throw new Error('User does not exist')
        }
        // Check if password is correct
        const isPasswordCorrect = bcrypt.compareSync(
          credentials.password as string,
          user.password as string
        )

        // Throw error if password is incorrect
        if (!isPasswordCorrect) {
          throw new Error('Invalid password')
        }

        // Return user
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.email = user.email as string
        token.name = user.name as string
        token.role = user.role as string
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      session.user.role = token.role as string
      return session
    },
    async signIn({ account }) {
      // return true if user signed in with oauth
      if (account?.provider !== 'credentials') {
        return true
      }

      return true
    },
    authorized: async ({ request, auth }) => {
      // Check what path the user is trying to access
      let path = request.nextUrl.pathname

      // exclude all auth path
      if (path.includes('/api/auth')) {
        return NextResponse.next()
      }

      if (path.includes('/api')) {
        const isMobile = request.headers.get('X-App-Client')?.includes('mobile')

        if (request.method !== 'GET') {
          if (!isMobile) {
            // Check role for web app (cannot use roleCheck or use auth() because it will return useLayoutEffect, which leads to a mismatch between the initial   )
            const isAdmin = await roleCheckToken({
              role: 'ADMIN',
              req: request,
            })
            const isHost = await roleCheckToken({ role: 'HOST', req: request })

            if (path.includes('categories') && !isAdmin) {
              //For categories, only allow ADMIN
              return new NextResponse('Forbidden', { status: 403 })
            } else if (path.includes('events') && !isAdmin && !isHost) {
              // For events API, only allow Admin and Host
              return new NextResponse('Forbidden', { status: 403 })
            } else if (path.includes('jobs')) {
              // Only logged in user can apply
              if (path.includes('apply')) {
                if (!(await roleCheckToken({ req: request }))) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              }
              else {
                // For job API, only allow Admin
                if (!isAdmin) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              }
            } else if (path.includes('events') && !isAdmin && !isHost) {
              // For events API, only allow Admin and Host
              return new NextResponse('Forbidden', { status: 403 })
            } else if (path.includes('posts') && !isAdmin) {
              // For Post like API, Only logged in user can like post
              if (path.includes('likes')) {
                if (!(await roleCheckToken({ req: request }))) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              } else {
                // For posts API, only allow Admin
                if (!isAdmin) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              }
            }
            return NextResponse.next()
          } else {
            //TODO: Check role for mobile app
          }
        } else {
          const secretHeader = request.headers.get('secret')
          if (secretHeader && validateSecretToken(secretHeader)) {
            return NextResponse.next()
          }
          return new NextResponse('Forbidden', { status: 403 })
        }
      }

      // extract the locale from the path
      path = '/' + path.split('/')[2]

      // check if user is logged in
      const isLoggedIn = !!auth?.user

      // Check if user is trying to access a private path
      if (PRIVATE_PATHS.includes(path) && !isLoggedIn) {
        return NextResponse.redirect(
          new URL('/signIn?message=sign-in-required', request.nextUrl.origin)
        )
      }

      // Check if user is trying to access an auth path
      if (AUTH_PATHS.includes(path) && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.nextUrl.origin))
      }

      // Wrap with the i18n response for internationalization and translations
      const response = i18nRouter(request, i18nConfig)

      // Add a custom header
      response.headers.set('current-path', request.nextUrl.pathname)

      return response
    },
  },
  events: {
    linkAccount: async ({ user }) => {
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      })

      return
    },
  },
} satisfies NextAuthConfig
