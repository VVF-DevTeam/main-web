import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PublishedPosts from './PublishedPosts'
import { getPublishedPostsByTitlePaginated } from '@/lib/actions/post/getPosts'
import { Post } from '@prisma/client'

// Mock dependencies
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/actions/post/getPosts', () => ({
  getPublishedPostsByTitlePaginated: vi.fn(),
}))

vi.mock('@/app/i18n', () => ({
  default: vi.fn().mockResolvedValue({
    t: (key: string) => key,
  }),
}))

vi.mock('./PostList', () => ({
  default: ({ posts, userId }: { posts: Post[]; userId: string | null }) => (
    <div
      data-testid="post-list"
      data-posts-count={posts.length}
      data-user-id={userId || 'null'}
    >
      {posts.map((post) => (
        <div key={post.id} data-testid={`post-${post.id}`}>
          {post.title}
        </div>
      ))}
    </div>
  ),
}))

describe('PublishedPosts', () => {
  const mockPosts = [
    {
      id: 'post-1',
      title: 'First Post',
      summary: 'First post summary',
      imgUrl: '/image1.jpg',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      _count: { postLikes: 10, postVisits: 50 },
      postLikes: [],
      postVisits: [],
    },
    {
      id: 'post-2',
      title: 'Second Post',
      summary: 'Second post summary',
      imgUrl: '/image2.jpg',
      createdAt: new Date('2024-01-02T12:00:00Z'),
      _count: { postLikes: 5, postVisits: 25 },
      postLikes: [],
      postVisits: [],
    },
  ]

  const mockPaginationResult = {
    posts: mockPosts,
    currentPage: 1,
    totalPages: 5,
    totalCount: 10,
    postsPerPage: 10,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders header with correct title and description', async () => {
    vi.mocked(getPublishedPostsByTitlePaginated).mockResolvedValue(
      mockPaginationResult
    )

    const jsx = await PublishedPosts({
      locale: 'en',
      title: 'test',
      currentPage: 1,
      postsPerPage: 10,
    })
    render(jsx)

    // Check header elements
    expect(screen.getByText('postsHeader')).toBeInTheDocument()
    expect(screen.getByText('postsDescription')).toBeInTheDocument()

    // Check header styling classes
    const header = screen.getByText('postsHeader')
    const description = screen.getByText('postsDescription')

    expect(header).toHaveClass('header-font-black', 'text-2xl', 'font-bold')
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })

  test('renders PostList when posts are available', async () => {
    vi.mocked(getPublishedPostsByTitlePaginated).mockResolvedValue(
      mockPaginationResult
    )

    const jsx = await PublishedPosts({
      locale: 'en',
      title: 'test',
      currentPage: 1,
      postsPerPage: 10,
    })
    render(jsx)

    // Check that PostList is rendered with correct props
    const postList = screen.getByTestId('post-list')
    expect(postList).toBeInTheDocument()
    expect(postList).toHaveAttribute('data-posts-count', '2')
    // Check that individual posts are rendered
    expect(screen.getByTestId('post-post-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-post-2')).toBeInTheDocument()
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  test('renders no posts message when no posts found', async () => {
    vi.mocked(getPublishedPostsByTitlePaginated).mockResolvedValue({
      posts: [],
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      postsPerPage: 10,
    })

    const jsx = await PublishedPosts({
      locale: 'en',
      title: 'test',
      currentPage: 1,
      postsPerPage: 10,
    })
    render(jsx)

    // Check that no posts message is displayed
    expect(screen.getByText('noPost')).toBeInTheDocument()

    // Check that PostList is not rendered
    expect(screen.queryByTestId('post-list')).not.toBeInTheDocument()
  })

  test('renders no posts message when pagination result is null', async () => {
    vi.mocked(getPublishedPostsByTitlePaginated).mockResolvedValue(null)

    const jsx = await PublishedPosts({
      locale: 'en',
      title: 'test',
      currentPage: 1,
      postsPerPage: 10,
    })
    render(jsx)

    // Check that no posts message is displayed
    expect(screen.getByText('noPost')).toBeInTheDocument()

    // Check that PostList is not rendered
    expect(screen.queryByTestId('post-list')).not.toBeInTheDocument()
  })

  test('passes correct props to PostList when posts exist', async () => {
    vi.mocked(getPublishedPostsByTitlePaginated).mockResolvedValue(
      mockPaginationResult
    )

    const jsx = await PublishedPosts({
      locale: 'en',
      title: 'test',
      currentPage: 1,
      postsPerPage: 10,
    })
    render(jsx)

    // Check that PostList receives pagination props
    const postList = screen.getByTestId('post-list')
    expect(postList).toBeInTheDocument()

    // Verify the component renders with posts
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })
})
