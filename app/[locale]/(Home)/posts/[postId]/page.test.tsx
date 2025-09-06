// page.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// --- Mocks BEFORE importing SUT ---
vi.mock('next/navigation', () => ({
  __esModule: true,
  redirect: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma: {
    post: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    postVisits: { create: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(async () => ({ user: { id: 'test-user' } })), // default; override per-test
}))

vi.mock('@/components/ui/back-button', () => ({
  __esModule: true,
  default: () => <div data-testid="back-button" />,
}))

vi.mock('@/app/[locale]/(Home)/posts/[postId]/_components/PostBody', () => ({
  __esModule: true,
  default: () => <div data-testid="post-body" />,
}))

// --- Import SUT & mocked symbols ---
import PostPage from './page'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

describe('PostPage', () => {
  const mockedRedirect = vi.mocked(redirect)
  const mockedPostFindUnique = vi.mocked(prisma.post.findUnique)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('redirects to "/" when postId is falsy', async () => {
    const jsx = await PostPage({ params: Promise.resolve({ postId: '' }) })
    expect(mockedRedirect).toHaveBeenCalledWith('/')
    expect(jsx).toBeUndefined()
  })

  test('returns null when post not found', async () => {
    mockedPostFindUnique.mockResolvedValueOnce(null)
    const jsx = await PostPage({
      params: Promise.resolve({ postId: 'missing' }),
    })
    expect(jsx).toBeNull()
  })

  test('renders back button and PostBody when post exists (with joined user)', async () => {
    // Type the mock as the *joined* payload that page.tsx expects:
    type PostWithUser = Prisma.PostGetPayload<{
      include: { user: { select: { name: true } } }
    }>

    const post: PostWithUser = {
      id: 'p1',
      title: 'Hello',
      content: 'content',
      summary: null,
      imgUrl: 'https://x/y.jpg',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'u1',
      user: { name: 'Alice' },
    }

    mockedPostFindUnique.mockResolvedValueOnce(post)

    const jsx = await PostPage({ params: Promise.resolve({ postId: 'p1' }) })
    render(jsx!)

    expect(screen.getByTestId('back-button')).toBeInTheDocument()
    expect(screen.getByTestId('post-body')).toBeInTheDocument()
  })
})
