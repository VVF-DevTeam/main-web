import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostTitle from './TitleForm'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'
import { Post } from '@prisma/client'
import { AxiosStatic } from 'axios'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/axios', () => ({
  axiosInstance: { put: vi.fn() },
}))

describe('TitleForm', () => {
  beforeEach(() => vi.clearAllMocks())

  test('renders title in view mode', () => {
    render(
      <PostTitle post={{ id: '1', title: 'A valid post title' } as Post} />
    )
    expect(screen.getByText('Post Title')).toBeInTheDocument()
    expect(screen.getByText('A valid post title')).toBeInTheDocument()
    expect(screen.getByText(/Edit Title/i)).toBeInTheDocument()
  })

  test('submits updated title successfully', async () => {
    vi.mocked(axiosInstance.put as AxiosStatic).mockResolvedValueOnce({})

    const { container } = render(
      <PostTitle post={{ id: '1', title: 'Initial valid title' } as Post} />
    )

    fireEvent.click(screen.getByText(/Edit Title/i))

    // Input has role textbox (no placeholder)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, {
      target: { value: 'Updated title >= 10 chars' },
    })

    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/posts/edit/1', {
        title: 'Updated title >= 10 chars',
      })
    })
    expect(toast.success).toHaveBeenCalled()
  })

  test('shows error toast on API failure', async () => {
    vi.mocked(axiosInstance.put as AxiosStatic).mockRejectedValueOnce(
      new Error('fail')
    )

    const { container } = render(
      <PostTitle post={{ id: '1', title: 'Initial valid title' } as Post} />
    )

    fireEvent.click(screen.getByText(/Edit Title/i))

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Another valid title' } })

    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
