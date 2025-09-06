import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostSummary from './SummaryForm'
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

describe('SummaryForm', () => {
  beforeEach(() => vi.clearAllMocks())

  test('renders summary in view mode', () => {
    render(
      <PostSummary post={{ id: '2', summary: 'Short summary text' } as Post} />
    )
    expect(screen.getByText('Post Summary')).toBeInTheDocument()
    expect(screen.getByText('Short summary text')).toBeInTheDocument()
    expect(screen.getByText(/Edit Summary/i)).toBeInTheDocument()
  })

  test('submits updated summary successfully', async () => {
    vi.mocked(axiosInstance.put as AxiosStatic).mockResolvedValueOnce({})

    const { container } = render(
      <PostSummary post={{ id: '2', summary: 'Existing summary' } as Post} />
    )

    fireEvent.click(screen.getByText(/Edit Summary/i))

    const textarea = screen.getByPlaceholderText('Type here')
    fireEvent.change(textarea, {
      target: { value: 'This is a valid summary (>= 10 chars).' },
    })

    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/posts/edit/2', {
        summary: 'This is a valid summary (>= 10 chars).',
      })
    })
    expect(toast.success).toHaveBeenCalled()
  })

  test('shows error toast on API failure', async () => {
    vi.mocked(axiosInstance.put as AxiosStatic).mockRejectedValueOnce(
      new Error('fail')
    )

    const { container } = render(
      <PostSummary post={{ id: '2', summary: 'Existing summary' } as Post} />
    )

    fireEvent.click(screen.getByText(/Edit Summary/i))

    const textarea = screen.getByPlaceholderText('Type here')
    fireEvent.change(textarea, { target: { value: 'Another valid summary.' } })

    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
