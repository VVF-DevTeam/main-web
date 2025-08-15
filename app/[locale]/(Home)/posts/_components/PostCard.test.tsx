import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostCard from './PostCard'

interface PostStatsProps {
  postLikes: number
  postViews: number
  hasLiked: boolean
  hasViewed: boolean
  postId: string
  userId: string | null
}
// Mock PostStats component
vi.mock('./PostStats', () => ({
  default: ({
    postLikes,
    postViews,
    hasLiked,
    hasViewed,
    postId,
    userId,
  }: PostStatsProps) => (
    <div
      data-testid="post-stats"
      data-likes={postLikes}
      data-views={postViews}
      data-liked={hasLiked}
      data-viewed={hasViewed}
      data-post-id={postId}
      data-user-id={userId}
    />
  ),
}))

describe('PostCard', () => {
  const defaultProps = {
    id: 'post-1',
    title: 'Test Post Title',
    imageUrl:
      'https://images.unsplash.com/photo-1615731446707-6ad24074bdd5?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    summary:
      'This is a test post summary that should be displayed in the card.',
    postLikes: 42,
    postViews: 123,
    hasLiked: false,
    hasViewed: true,
    userId: 'user-123',
  }

  test('renders post card with all elements', () => {
    render(<PostCard {...defaultProps} />)

    // Check title and summary
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This is a test post summary that should be displayed in the card.'
      )
    ).toBeInTheDocument()

    // Check date
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument()

    // Check image
    const image = screen.getByAltText('Thumbnail for Test Post Title post')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1615731446707-6ad24074bdd5?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    )

    // Check PostStats component is rendered
    expect(screen.getByTestId('post-stats')).toBeInTheDocument()

    // Check Read More button
    expect(screen.getByText('Read More')).toBeInTheDocument()
  })

  test('renders Read More link with correct href', () => {
    render(<PostCard {...defaultProps} />)

    const readMoreLink = screen.getByText('Read More').closest('a')
    expect(readMoreLink).toHaveAttribute('href', 'posts/post-1')
  })
})
