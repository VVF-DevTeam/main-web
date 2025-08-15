import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AllPosts from './page'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { prisma } from '@/lib/db'

// Mock dependencies
vi.mock('@/lib/actions/user/roleCheck', () => ({
  roleCheck: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/components/ui/back-button', () => ({
  default: () => <div data-testid="back-button">Back Button</div>,
}))

vi.mock(
  '@/app/[locale]/(Home)/posts/(Admin)/allPosts/_components/data-table',
  () => {
    type Row = Record<string, unknown>
    const DataTable = ({ data }: { data: ReadonlyArray<Row> }) => (
      <div data-testid="data-table" data-rows-count={String(data?.length ?? 0)}>
        Data Table Component
      </div>
    )
    return { __esModule: true, DataTable }
  }
)

// Mock next/navigation redirect
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('AllPosts', () => {
  const mockPosts = [
    {
      id: 'post-1',
      title: 'First Post',
      summary: 'First post summary',
      content: 'First post content',
      imgUrl: '/image1.jpg',
      isPublished: true,
      createdAt: new Date('2024-01-01T12:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z'),
      userId: 'user-1',
    },
    {
      id: 'post-2',
      title: 'Second Post',
      summary: 'Second post summary',
      content: 'Second post content',
      imgUrl: '/image2.jpg',
      isPublished: false,
      createdAt: new Date('2024-01-02T12:00:00Z'),
      updatedAt: new Date('2024-01-02T12:00:00Z'),
      userId: 'user-2',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders all posts page with data', async () => {
    vi.mocked(roleCheck).mockResolvedValue(true)
    vi.mocked(prisma.post.findMany).mockResolvedValue(mockPosts)

    const jsx = await AllPosts()
    render(jsx)

    // Check header elements
    expect(screen.getByText('All Posts')).toBeInTheDocument()
    expect(
      screen.getByText(/All published and unpublished posts appear here/)
    ).toBeInTheDocument()

    // Check data table is rendered with correct data
    const dataTable = screen.getByTestId('data-table')
    expect(dataTable).toBeInTheDocument()
    expect(dataTable).toHaveAttribute('data-rows-count', '2')
  })

  test('renders page with empty posts list', async () => {
    vi.mocked(roleCheck).mockResolvedValue(true)
    vi.mocked(prisma.post.findMany).mockResolvedValue([])

    const jsx = await AllPosts()
    render(jsx)

    // Check header
    expect(screen.getByText('All Posts')).toBeInTheDocument()

    // Check data table is rendered with empty data
    const dataTable = screen.getByTestId('data-table')
    expect(dataTable).toBeInTheDocument()
    expect(dataTable).toHaveAttribute('data-rows-count', '0')
  })

  test('redirects non-admin users', async () => {
    vi.mocked(roleCheck).mockResolvedValue(false)

    await AllPosts()

    // Should redirect (redirect function should be called)
    const { redirect } = await import('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/posts')
  })

  test('fetches posts with correct query parameters', async () => {
    vi.mocked(roleCheck).mockResolvedValue(true)
    vi.mocked(prisma.post.findMany).mockResolvedValue([])

    const jsx = await AllPosts()
    render(jsx)

    // Check that findMany was called with correct parameters
    expect(prisma.post.findMany).toHaveBeenCalledWith({
      orderBy: {
        updatedAt: 'desc',
      },
    })
  })
})
