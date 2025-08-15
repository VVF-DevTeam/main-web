// page.test.tsx (minimal, no `any`)
import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import Posts from './page'
import { roleCheck } from '@/lib/actions/user/roleCheck'

// --- Mocks ---
vi.mock('@/app/i18n', () => ({
  default: vi.fn().mockResolvedValue({
    t: (key: string) => key,
  }),
}))
vi.mock('@/lib/actions/user/roleCheck', () => ({
  __esModule: true,
  roleCheck: vi.fn(),
}))

// next/link → simple typed anchor
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) => (
    <a data-testid="next-link" href={href} {...rest}>
      {children}
    </a>
  ),
}))

// icons → typed svg stubs
vi.mock('lucide-react', () => ({
  __esModule: true,
  PlusCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-plus" {...props} />
  ),
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-arrow" {...props} />
  ),
}))

// SearchBox → simple marker (no prop assertions)
vi.mock('../../components/SearchBox', () => ({
  __esModule: true,
  default: () => <div data-testid="search-box" />,
}))

// Button → typed minimal stub
vi.mock('@/components/ui/button', () => ({
  __esModule: true,
  Button: ({
    children,
    ...rest
  }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button data-testid="button" {...rest}>
      {children}
    </button>
  ),
}))

// i18n → return only keys used by page.tsx
vi.mock('@/app/i18n', () => ({
  default: vi.fn().mockResolvedValue({
    t: (key: string) => key,
  }),
}))

// Child lists → simple markers (no prop checks)
vi.mock('./_components/PublishedPosts', () => ({
  __esModule: true,
  default: () => <div data-testid="published-posts" />,
}))
vi.mock('../_components/_socialmediaposts/PaginatedSocialPosts', () => ({
  __esModule: true,
  default: () => <div data-testid="social-posts" />,
}))
vi.mock('@/components/loadingSkeleton/PostsSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="posts-skeleton" />,
}))

const mockedRoleCheck = vi.mocked(roleCheck)

describe('Posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders header/description; hides admin buttons for non-admin', async () => {
    mockedRoleCheck.mockResolvedValueOnce(false)

    const jsx = await Posts({
      params: Promise.resolve({ locale: 'en' }),
      searchParams: Promise.resolve({
        title: 'guitar',
        page: 2,
        socialPage: 3,
      }),
    })
    render(jsx)

    // children mount (no deep prop assertions)
    expect(screen.getByTestId('search-box')).toBeInTheDocument()
    expect(screen.getByTestId('published-posts')).toBeInTheDocument()
    expect(screen.getByTestId('social-posts')).toBeInTheDocument()

    // admin actions hidden
    expect(screen.queryByText('All Posts')).not.toBeInTheDocument()
    expect(screen.queryByText('New Post')).not.toBeInTheDocument()

    expect(mockedRoleCheck).toHaveBeenCalledWith({ role: 'ADMIN' })
  })

  test('shows admin buttons and correct links for admin', async () => {
    mockedRoleCheck.mockResolvedValueOnce(true)

    const jsx = await Posts({
      params: Promise.resolve({ locale: 'en' }),
      searchParams: Promise.resolve({ title: '' }),
    })
    render(jsx)

    // buttons visible
    expect(screen.getByText('allPost')).toBeInTheDocument()
    expect(screen.getByText('newPost')).toBeInTheDocument()

    // links correct
    const hrefs = screen
      .getAllByTestId('next-link')
      .map((a) => (a as HTMLAnchorElement).getAttribute('href'))
    expect(hrefs).toContain('/posts/allPosts')
    expect(hrefs).toContain('/posts/createNewPost')
  })
})
