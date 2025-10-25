import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostList from './PostListVertical'

// Mock PostCard component
vi.mock('./PostCard', () => ({
  default: ({ id, title }: { id: string; title: string }) => (
    <div data-testid={`post-card-${id}`}>{title}</div>
  ),
}))

// Mock PostPagination component
vi.mock('./PostPagination', () => ({
  default: () => <div data-testid="post-pagination" />,
}))

describe('PostList', () => {
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

  test('renders list of posts', async () => {
    const jsx = await PostList({ posts: mockPosts, userId: 'user-123' })
    render(jsx)

    expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-card-post-2')).toBeInTheDocument()
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  test('handles empty posts array', async () => {
    const jsx = await PostList({ posts: [], userId: 'user-123' })
    render(jsx)

    expect(screen.queryByTestId(/post-card-/)).not.toBeInTheDocument()
  })

  test('handles null userId', async () => {
    const jsx = await PostList({ posts: mockPosts, userId: null })
    render(jsx)

    expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-card-post-2')).toBeInTheDocument()
  })

  test('handles empty string userId', async () => {
    const jsx = await PostList({ posts: mockPosts, userId: '' })
    render(jsx)

    expect(screen.getByTestId('post-card-post-1')).toBeInTheDocument()
    expect(screen.getByTestId('post-card-post-2')).toBeInTheDocument()
  })
})
