import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreatePostForm from './CreatePostForm'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'
import { AxiosError, AxiosResponse } from 'axios'

// Mock dependencies
vi.mock('@/lib/axios', () => ({
  axiosInstance: {
    post: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@radix-ui/react-separator', () => ({
  Separator: () => <div data-testid="separator" />,
}))

describe('CreatePostForm', () => {
  const defaultProps = {
    author: 'user-123',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders form with all elements', () => {
    render(<CreatePostForm {...defaultProps} />)

    // Check header
    expect(screen.getByText('Give a title to your post')).toBeInTheDocument()
    expect(
      screen.getByText(/What would you like to name your post/)
    ).toBeInTheDocument()

    // Check form elements
    expect(screen.getByLabelText('Post Title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('eg: My first post')).toBeInTheDocument()
    expect(screen.getByText('What is your post about?')).toBeInTheDocument()

    // Check buttons
    expect(screen.getByText('Create Post')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  test('handles form submission successfully', async () => {
    const mockResponse = { status: 200, data: { id: 'post-456' } }
    vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse)

    render(<CreatePostForm {...defaultProps} />)

    // Fill in the form with a valid title
    const titleInput = screen.getByPlaceholderText('eg: My first post')
    fireEvent.change(titleInput, { target: { value: 'Test Post Title' } })

    // Wait for form validation to complete
    await waitFor(() => {
      expect(titleInput).toHaveValue('Test Post Title')
    })

    // Submit the form
    const submitButton = screen.getByText('Create Post')
    fireEvent.click(submitButton)

    // Wait for the API call
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/posts/create', {
        title: 'Test Post Title',
        userId: 'user-123',
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Post created successfully')
  })

  test('handles duplicate post error', async () => {
    const mockError = new AxiosError(
      'Duplicate post',
      '409',
      undefined,
      undefined,
      {
        status: 409,
        data: { message: 'Duplicate post' },
      } as AxiosResponse
    )
    vi.mocked(axiosInstance.post).mockRejectedValue(mockError)

    render(<CreatePostForm {...defaultProps} />)

    // Fill in the form with a valid title
    const titleInput = screen.getByPlaceholderText('eg: My first post')
    fireEvent.change(titleInput, { target: { value: 'Duplicate Title' } })

    // Wait for form validation to complete
    await waitFor(() => {
      expect(titleInput).toHaveValue('Duplicate Title')
    })

    // Submit the form
    const submitButton = screen.getByText('Create Post')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Duplicate Post', {
        description: 'There is already a post with this title',
      })
    })
  })

  test('handles general API error', async () => {
    const mockError = new AxiosError(
      'Server error',
      '500',
      undefined,
      undefined,
      {
        status: 500,
        data: { message: 'Server error' },
      } as AxiosResponse
    )
    vi.mocked(axiosInstance.post).mockRejectedValue(mockError)

    render(<CreatePostForm {...defaultProps} />)

    // Fill in the form with a valid title
    const titleInput = screen.getByPlaceholderText('eg: My first post')
    fireEvent.change(titleInput, { target: { value: 'Test Title' } })

    // Wait for form validation to complete
    await waitFor(() => {
      expect(titleInput).toHaveValue('Test Title')
    })

    // Submit the form
    const submitButton = screen.getByText('Create Post')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Error making request to database',
        {
          description: 'Something went wrong. Please contact the admin',
        }
      )
    })
  })

  test('validates required title field', async () => {
    render(<CreatePostForm {...defaultProps} />)

    // Try to submit without filling the title
    const submitButton = screen.getByText('Create Post')
    fireEvent.click(submitButton)

    // Button should be disabled or form should show validation error
    expect(axiosInstance.post).not.toHaveBeenCalled()
  })
})
