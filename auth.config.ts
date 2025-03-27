import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { NextAuthConfig } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'
import { NextResponse } from 'next/server'

import { prisma } from './lib/db'
import { PRIVATE_PATHS } from './lib/appRoutes'
import { AUTH_PATHS } from './lib/appRoutes'

import { i18nRouter } from 'next-i18n-router'
import i18nConfig from './i18nConfig'
import { validateSecretToken } from './lib/utilFunctions/secretToken'

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
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      return session
    },
    async signIn({ account }) {
      // return true if user signed in with oauth
      if (account?.provider !== 'credentials') {
        return true
      }

      return true
    },
    authorized: ({ request, auth }) => {
      // Check what path the user is trying to access
      let path = request.nextUrl.pathname

      if (path.includes('/api') && !path.includes('/auth')) {
        if (request.method !== 'GET') return NextResponse.next()
        const secretHeader = request.headers.get('secret')
        if (secretHeader && validateSecretToken(secretHeader)) {
          return NextResponse.next()
        }
        return new NextResponse('Fobidden', { status: 403 })
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
        return Response.redirect(new URL('/', request.nextUrl.origin))
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
