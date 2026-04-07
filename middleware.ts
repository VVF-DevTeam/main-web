import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { i18nRouter } from 'next-i18n-router'
import i18nConfig from './i18nConfig'
import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit'

// app/[locale]/(Home)/posts/page.tsx — listing only (not /posts/[postId] or admin)
const POSTS_LISTING_PATH =
  /^\/(?:[a-z]{2}|[a-z]{2}-[A-Z]{2})\/posts\/?$/i

// Patterns for routes that need authentication middleware
const PROTECTED_PAGE_PATTERNS = [
  // Profile pages
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/profile(\/.*)?$/,
  // Admin post management pages
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/posts\/createNewPost(\/.*)?$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/posts\/allPosts(\/.*)?$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/posts\/editPost(\/.*)?$/,
  // Admin event management pages
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/events\/allEvents(\/.*)?$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/events\/createEvent(\/.*)?$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/events\/createEventCategory(\/.*)?$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/events\/createEventSeries(\/.*)?$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/events\/editEvent(\/.*)?$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/events\/manageSponsors(\/.*)?$/,
  // Auth pages (to redirect logged-in users away)
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/signIn$/,
  /^\/([a-z]{2}|[a-z]{2}-[A-Z]{2})\/signUp$/,
]

function isProtectedRoute(pathname: string): boolean {
  // API routes always need auth middleware
  if (pathname.startsWith('/api')) return true
  // Check protected page patterns
  return PROTECTED_PAGE_PATTERNS.some((pattern) => pattern.test(pathname))
}

// Type for NextAuth middleware function
type NextAuthMiddleware = (
  request: NextRequest,
  event: NextFetchEvent
) => Promise<Response>

// NextAuth middleware with explicit typing for App Router usage
// Cast through unknown because NextAuth's overloaded types don't directly match Next.js middleware signature
const nextAuthMiddleware = NextAuth(authConfig).auth as unknown as NextAuthMiddleware

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
): Promise<NextResponse | Response> {
  const { pathname } = request.nextUrl

  // Exclude common static files from i18n routing
  // These should be handled as static files, not as locale routes
  const staticFiles = ['/robots.txt', '/sitemap.xml', '/sitemap', '/favicon.ico']
  if (staticFiles.includes(pathname)) {
    // Let Next.js handle these as static files
    return NextResponse.next()
  }

  if (POSTS_LISTING_PATH.test(pathname)) {
    const clientIp = getClientIp(request.headers.get('x-forwarded-for'))
    const rate = checkRateLimit({
      key: `posts-page:${clientIp}`,
      limit: 80,
      windowMs: 60000,
    })
    if (!rate.allowed) {
      return new NextResponse('Too many requests. Please try again in 1 minute.', {
        status: 429,
        headers: {
          'Retry-After': String(rate.retryAfterSeconds),
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    }
  }

  if (isProtectedRoute(pathname)) {
    // Protected routes: run through NextAuth middleware
    // This executes the authorized callback in auth.config.ts (handles auth + i18n)
    return nextAuthMiddleware(request, event)
  }

  // Public routes: just i18n routing (no auth overhead, bfcache-friendly)
  const response = i18nRouter(request, i18nConfig)
  
  // Set current-path header for public routes too (needed for BackButton component)
  if (response instanceof NextResponse) {
    response.headers.set('current-path', pathname)
  }
  
  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
