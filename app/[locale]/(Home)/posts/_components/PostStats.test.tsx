import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostStats from './PostStats'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/lib/axios', () => ({
  axiosInstance: {
    patch: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}))

describe('PostStats', () => {
  const defaultProps = {
    postLikes: 42,
    postViews: 123,
    hasLiked: false,
    hasViewed: true,
    postId: 'post-123',
    userId: 'user-456',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders post stats with correct counts', () => {
    render(<PostStats {...defaultProps} />)

    // Check likes and views are displayed
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()

    // Check accessibility labels
    expect(screen.getByLabelText('Like post')).toBeInTheDocument()
    expect(screen.getByLabelText('Post views')).toBeInTheDocument()
  })

  test('handles like action when user is logged in', async () => {
    vi.mocked(axiosInstance.patch).mockResolvedValue({ status: 200 })

    render(<PostStats {...defaultProps} />)

    const likeButton = screen.getByLabelText('Like post')
    fireEvent.click(likeButton)

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/api/posts/likes/post-123',
        {
          userId: 'user-456',
          action: 'like',
        }
      )
    })

    expect(toast.success).toHaveBeenCalledWith('You have liked this post')
  })

  test('handles unlike action when user has already liked', async () => {
    vi.mocked(axiosInstance.patch).mockResolvedValue({ status: 200 })

    const likedProps = { ...defaultProps, hasLiked: true }
    render(<PostStats {...likedProps} />)

    const unlikeButton = screen.getByLabelText('Unlike post')
    fireEvent.click(unlikeButton)

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/api/posts/likes/post-123',
        {
          userId: 'user-456',
          action: 'unlike',
        }
      )
    })

    expect(toast.success).toHaveBeenCalledWith('You have unliked this post')
  })

  test('shows error when user is not logged in', async () => {
    const noUserProps = { ...defaultProps, userId: null }
    render(<PostStats {...noUserProps} />)

    const likeButton = screen.getByLabelText('Like post')
    fireEvent.click(likeButton)

    expect(toast.error).toHaveBeenCalledWith(
      'You must be logged in to like a post',
      {
        description: 'Please log in to like this post',
      }
    )

    expect(axiosInstance.patch).not.toHaveBeenCalled()
  })

  test('handles API error gracefully', async () => {
    vi.mocked(axiosInstance.patch).mockRejectedValue(new Error('API Error'))

    render(<PostStats {...defaultProps} />)

    const likeButton = screen.getByLabelText('Like post')
    fireEvent.click(likeButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong', {
        description: 'Please try again later',
      })
    })
  })
})
