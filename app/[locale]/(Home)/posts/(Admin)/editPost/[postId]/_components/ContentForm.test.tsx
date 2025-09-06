// ContentForm.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Post } from '@prisma/client'
import PostContent from './ContentForm'
import { axiosInstance } from '@/lib/axios'
import { toast } from 'sonner'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/axios', () => ({
  axiosInstance: { put: vi.fn() },
}))

// Lightweight Editor/TextPreview mocks
vi.mock('../../../../../../components/Editor', () => {
  interface EditorProps {
    value: string
    onChange: (value: string) => void
  }

  const MockEditor = ({ value, onChange }: EditorProps) => (
    <textarea
      data-testid="editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )

  return { __esModule: true, default: MockEditor }
})

vi.mock('../../../../../../components/TextPreview', () => {
  interface TextPreviewProps {
    value: string
  }

  const MockTextPreview = ({ value }: TextPreviewProps) => (
    <div data-testid="preview">{value}</div>
  )

  return { __esModule: true, default: MockTextPreview }
})

describe('ContentForm', () => {
  beforeEach(() => vi.clearAllMocks())

  test('renders post content in view mode', () => {
    render(
      <PostContent
        post={{ id: '1', content: 'Sample post content here' } as Post}
      />
    )
    expect(screen.getByText('Post Content')).toBeInTheDocument()
    expect(screen.getByTestId('preview')).toHaveTextContent(
      'Sample post content here'
    )
    expect(screen.getByText(/Edit Content/i)).toBeInTheDocument()
  })

  test('calls API and shows success toast on save (submit form directly)', async () => {
    vi.mocked(axiosInstance.put).mockResolvedValueOnce({})

    const { container } = render(
      <PostContent post={{ id: '1', content: 'X'.repeat(40) } as Post} />
    )

    // Open edit mode
    fireEvent.click(screen.getByText(/Edit Content/i))

    // Make content valid (> 30 chars)
    fireEvent.change(screen.getByTestId('editor'), {
      target: { value: 'This content is clearly more than thirty characters.' },
    })

    // Submit the FORM (bypasses disabled Save button due to isValid gating)
    const form = container.querySelector('form') as HTMLFormElement
    expect(form).toBeTruthy()
    fireEvent.submit(form)

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/posts/edit/1', {
        content: 'This content is clearly more than thirty characters.',
      })
    })

    expect(toast.success).toHaveBeenCalled()
  })
})
