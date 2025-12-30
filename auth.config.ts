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
import { Role } from '@prisma/client'
import * as jose from 'jose'
import { linkGuestPaymentsToUser } from './lib/actions/payment/linkGuestPayments'

export default {
  providers: [
    Github({
      clientId: process.env.GITHUB_TEST_CLIENT,
      clientSecret: process.env.GITHUB_TEST_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
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
        try {
          user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          })
        } catch (error) {
          console.error(error)
        }

        //   Check if user exists
        if (!user) {
          throw new Error('User does not exist, please double check your email')
        }

        // Check if password is correct
        const isPasswordCorrect = bcrypt.compareSync(
          credentials.password as string,
          user.password as string
        )

        // Throw error if password is incorrect
        if (!isPasswordCorrect) {
          throw new Error('Incorrect password, please try again')
        }

        // Return user
        const { password, ...userWithoutPassword } = user
        return {
          ...userWithoutPassword,
          role: user.role, // include roles separately to avoid conflict with NextAuth types
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.email = user.email as string
        token.name = user.name as string
        // Set default USER role for new users who don't have roles yet
        token.role =
          user.role && user.role.length > 0 ? (user.role as Role[]) : ['USER']
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      session.user.role = token.role as Role[]
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
                  return new NextResponse('Please log in to apply.', {
                    status: 403,
                  })
                }
              } else {
                // For job API, only allow Admin
                if (!isAdmin) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              }
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
            } else if (path.includes('users')) {
              // For users API, only logged in user can upload avatar
              if (!(await roleCheckToken({ req: request }))) {
                return new NextResponse('Please log in to upload avatar.', {
                  status: 403,
                })
              }
            } else if (path.includes('payment')) {
              // Allow guest checkout for checkout session creation endpoints
              const isCheckoutSessionCreate =
                path.includes('checkout-sessions/create') ||
                path.includes('checkout-sessions/create-multi')

              if (!isCheckoutSessionCreate) {
                // For other payment APIs, only logged in user can make payment
                if (!(await roleCheckToken({ req: request }))) {
                  return new NextResponse('Please log in to make payment.', {
                    status: 403,
                  })
                }
              }
            }
            return NextResponse.next()
          } else {
            //TODO: Check role for mobile app
            const jwtHeader = request.headers.get('Authorization')
            const response = NextResponse.next()
            if (!jwtHeader)
              return NextResponse.json(
                { message: 'Un-authorized' },
                { status: 401 }
              )
            try {
              const parts = jwtHeader.split(' ')
              if (parts.length !== 2 || parts[0] !== 'Bearer') {
                return NextResponse.json(
                  { message: 'Unauthorized: Invalid token format' },
                  { status: 401 }
                )
              }
              const token = parts[1]
              const secretKey = new TextEncoder().encode(
                process.env.AUTH_SECRET as string
              )

              const isJwtVerified = await jose.jwtVerify(token, secretKey)

              if (!isJwtVerified)
                return NextResponse.json(
                  { message: 'Un-authorized' },
                  { status: 401 }
                )

              const jwtDecoded = (await jose.decodeJwt(token)) as {
                email: string
                id: string
                role: string[]
              }

              const { role, id } = jwtDecoded
              response.headers.set('userId', id)

              if (path.includes('categories') && !role.includes('ADMIN')) {
                //For categories, only allow ADMIN
                return new NextResponse('Forbidden', { status: 403 })
              }
              if (
                path.includes('events') &&
                !role.includes('ADMIN') &&
                !role.includes('HOST')
              ) {
                // For events API, only allow Admin and Host
                return new NextResponse('Forbidden', { status: 403 })
              }

              if (path.includes('jobs')) {
                // Only logged in user can apply
                if (path.includes('apply') && !token) {
                  return new NextResponse('Forbidden', {
                    status: 403,
                  })
                }
                if (!path.includes('apply') && !role.includes('ADMIN')) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              }
              if (path.includes('posts')) {
                if (path.includes('likes')) {
                  if (!token) {
                    return new NextResponse('Forbidden', { status: 403 })
                  }
                } else if (!role.includes('ADMIN')) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              }
              if (path.includes('users')) {
                // For users API,  Only logged in user can access
                if (!token) {
                  return new NextResponse('Forbidden', { status: 403 })
                }
              }
              return response
            } catch (error) {
              console.log(error)
              return NextResponse.json(
                { message: 'Token expired' },
                { status: 401 }
              )
            }
          }
        } else {
          // bypass auth for subscriptions
          if (path.includes('subscriptions')) {
            return NextResponse.next()
          }

          // bypass auth for tickets
          if (path.includes('events/tickets')) {
            return NextResponse.next()
          }

          // Prevent access to events API without authentication on PC (use Prisma on server side to query the database then pass the data to the client side)
          // Client side will not make GET request to the database, except for some situations like: fetching ticket information, and subscription status
          // On phone, we use JWT token for authentication
          const secretHeader = request.headers.get('secret')
          const response = NextResponse.next()
          if (secretHeader && validateSecretToken(secretHeader)) {
            const jwtHeader = request.headers.get('Authorization')
            if (jwtHeader) {
              try {
                const parts = jwtHeader.split(' ')
                if (parts.length !== 2 || parts[0] !== 'Bearer') {
                  return NextResponse.json(
                    { message: 'Unauthorized: Invalid token format' },
                    { status: 401 }
                  )
                }
                const token = parts[1]
                const secretKey = new TextEncoder().encode(
                  process.env.AUTH_SECRET as string
                )

                const isJwtVerified = await jose.jwtVerify(parts[1], secretKey)

                if (!isJwtVerified)
                  return NextResponse.json(
                    { message: 'Un-authorized' },
                    { status: 401 }
                  )

                const jwtDecoded = (await jose.decodeJwt(token)) as {
                  email: string
                  id: string
                  role: Role[]
                }

                const { id } = jwtDecoded
                response.headers.set('userId', id)
              } catch (error) {
                console.log(error)
                return NextResponse.json(
                  { message: 'Token expired' },
                  { status: 401 }
                )
              }
            }
            return response
          }
          return new NextResponse('Forbidden', { status: 403 })
        }
      }

      // extract path without locale: /en/events/allEvents -> /events/allEvents
      const segments = path.split('/')
      path = '/' + segments.slice(2).join('/')

      // check if user is logged in
      const isLoggedIn = !!auth?.user

      // Check if user is trying to access a private path
      const isPrivatePath = PRIVATE_PATHS.some(
        (privatePath) =>
          path === privatePath || path.startsWith(privatePath + '/')
      )
      if (isPrivatePath && !isLoggedIn) {
        return NextResponse.redirect(
          new URL('/signIn?message=sign-in-required', request.nextUrl.origin)
        )
      }

      // Check if user is trying to access an auth path after logged in
      const isAuthPath = AUTH_PATHS.some(
        (authPath) => path === authPath || path.startsWith(authPath + '/')
      )
      if (isAuthPath && isLoggedIn) {
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
      // Update user, retry if fails with exponential backoff
      const maxRetries = 3
      const baseDelay = 1000 // 1 second
      let lastError: Error | unknown

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date(),
            },
          })

          // Link any guest payments made with this email to the user account
          if (user.id && user.email) {
            try {
              const linkResult = await linkGuestPaymentsToUser(
                user.id,
                user.email
              )
              if (linkResult.linkedCount > 0) {
                console.log(
                  `[OAUTH_LINK_ACCOUNT] Linked ${linkResult.linkedCount} guest payment(s) to user account`
                )
              }
            } catch (linkError) {
              // Log error but don't fail account linking if payment linking fails
              console.error(
                '[OAUTH_LINK_ACCOUNT] Failed to link guest payments:',
                linkError
              )
            }
          }

          // Success - return early
          return
        } catch (error) {
          lastError = error
          console.error(
            `Failed to update emailVerified for user ${user.id} (attempt ${
              attempt + 1
            }/${maxRetries + 1}):`,
            error
          )

          // If this was the last attempt, throw the error
          if (attempt === maxRetries) {
            throw new Error(
              `Failed to verify email after ${maxRetries + 1} attempts. Please try signing in again.`
            )
          }

          // Wait before retrying with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    },
    createUser: async ({ user }) => {
      // Set USER role for new accounts created through OAuth, retry if fails with exponential backoff
      const maxRetries = 3
      const baseDelay = 1000 // 1 second
      let lastError: Error | unknown

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              role: ['USER'],
            },
          })

          // Link any guest payments made with this email to the new user account
          if (user.id && user.email) {
            try {
              const linkResult = await linkGuestPaymentsToUser(
                user.id,
                user.email
              )
              if (linkResult.linkedCount > 0) {
                console.log(
                  `[OAUTH_CREATE_USER] Linked ${linkResult.linkedCount} guest payment(s) to new user account`
                )
              }
            } catch (linkError) {
              // Log error but don't fail user creation if payment linking fails
              console.error(
                '[OAUTH_CREATE_USER] Failed to link guest payments:',
                linkError
              )
            }
          }

          // Success - return early
          return
        } catch (error) {
          lastError = error
          console.error(
            `Failed to set USER role for user ${user.id} (attempt ${
              attempt + 1
            }/${maxRetries + 1}):`,
            error
          )

          // If this was the last attempt, throw the error
          if (attempt === maxRetries) {
            throw new Error(
              `Failed to set user role after ${maxRetries + 1} attempts. Please try signing in again.`
            )
          }

          // Wait before retrying with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    },
  },
} satisfies NextAuthConfig
