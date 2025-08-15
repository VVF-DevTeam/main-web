// page.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Post } from '@prisma/client'
import EditPost from './page'

// --- Mocks ---
vi.mock('next/navigation', () => ({
  __esModule: true,
  redirect: vi.fn(),
}))

vi.mock('@/lib/actions/user/roleCheck', () => ({
  __esModule: true,
  roleCheck: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  __esModule: true,
  prisma: {
    post: {
      findUnique: vi.fn(),
    },
  },
}))

// Child components & helpers → stub to simple markers so we can assert render & props
vi.mock(
  '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/TitleForm',
  () => ({
    __esModule: true,
    default: ({ post }: { post: Post }) => (
      <div data-testid="title-form">{post?.title}</div>
    ),
  })
)
vi.mock(
  '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/SummaryForm',
  () => ({
    __esModule: true,
    default: ({ post }: { post: Post }) => (
      <div data-testid="summary-form">{post?.summary}</div>
    ),
  })
)
vi.mock(
  '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/ImageForm',
  () => ({
    __esModule: true,
    default: ({ post }: { post: Post }) => (
      <div data-testid="image-form">{post?.imgUrl}</div>
    ),
  })
)
vi.mock(
  '@/app/[locale]/(Home)/posts/(Admin)/editPost/[postId]/_components/ContentForm',
  () => ({
    __esModule: true,
    default: ({ post }: { post: Post }) => (
      <div data-testid="content-form">{post?.content}</div>
    ),
  })
)
vi.mock('@/app/[locale]/components/PublishButton', () => ({
  __esModule: true,
  default: ({
    id,
    canPublish,
    isPublished,
    type,
    domain,
  }: {
    id: string
    canPublish: boolean
    isPublished: boolean
    type: string
    domain: string
  }) => (
    <div
      data-testid="publish-button"
      data-id={id}
      data-canpublish={String(canPublish)}
      data-ispublished={String(isPublished)}
      data-type={type}
      data-domain={domain}
    />
  ),
}))
vi.mock('@/components/ui/back-button', () => ({
  __esModule: true,
  default: () => <div data-testid="back-button" />,
}))
vi.mock('@/components/instruction/ImageAddInstruction', () => ({
  __esModule: true,
  default: () => <div data-testid="image-instruction" />,
}))
vi.mock('@/components/instruction/EditorInstructions', () => ({
  __esModule: true,
  default: () => <div data-testid="editor-instruction" />,
}))

// Pull the mocked modules so we can control their behavior
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { prisma } from '@/lib/db'

describe('EditPost', () => {
  // create typed mocked refs once
  const mockedRedirect = vi.mocked(redirect)
  const mockedRoleCheck = vi.mocked(roleCheck)
  const mockedFindUnique = vi.mocked(prisma.post.findUnique)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('redirects to /posts if user is not admin', async () => {
    mockedRoleCheck.mockResolvedValueOnce(false)

    await EditPost({ params: Promise.resolve({ postId: 'abc' }) })

    expect(mockedRedirect).toHaveBeenCalledWith('/posts')
  })

  test('redirects to /posts if post not found', async () => {
    mockedRoleCheck.mockResolvedValueOnce(true)
    mockedFindUnique.mockResolvedValueOnce(null)

    await EditPost({ params: Promise.resolve({ postId: 'missing' }) })

    expect(mockedRedirect).toHaveBeenCalledWith('/posts')
  })

  test('renders with partial fields (canPublish=false)', async () => {
    mockedRoleCheck.mockResolvedValueOnce(true)
    mockedFindUnique.mockResolvedValueOnce({
      id: 'p1',
      title: 'My Title',
      summary: 'My Summary',
      content: 'Some content',
      imgUrl: null, // missing image
      isPublished: false,
    } as Post)

    const jsx = await EditPost({ params: Promise.resolve({ postId: 'p1' }) })
    render(jsx)

    // Header + steps
    expect(screen.getByText('Edit Post')).toBeInTheDocument()
    expect(
      screen.getByText(/Fill all the fields to edit your post\./i)
    ).toBeInTheDocument()
    expect(screen.getByText('Steps completed: (3 / 4)')).toBeInTheDocument()

    // Section headings present
    expect(screen.getByText(/Step I :/i)).toBeInTheDocument()
    expect(screen.getByText(/Step II :/i)).toBeInTheDocument()
    expect(screen.getByText(/Step III :/i)).toBeInTheDocument()
    expect(screen.getByText(/Step IV :/i)).toBeInTheDocument()

    // Child components mounted
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
    expect(screen.getByTestId('image-instruction')).toBeInTheDocument()
    expect(screen.getByTestId('editor-instruction')).toBeInTheDocument()

    // Forms receive post props
    expect(screen.getByTestId('title-form')).toHaveTextContent('My Title')
    expect(screen.getByTestId('summary-form')).toHaveTextContent('My Summary')
    expect(screen.getByTestId('content-form')).toHaveTextContent('Some content')
    expect(screen.getByTestId('image-form')).toHaveTextContent('') // null → empty

    // PublishButton attributes
    const publish = screen.getByTestId('publish-button')
    expect(publish).toHaveAttribute('data-id', 'p1')
    expect(publish).toHaveAttribute('data-canpublish', 'false')
    expect(publish).toHaveAttribute('data-ispublished', 'false')
    expect(publish).toHaveAttribute('data-type', 'post')
    expect(publish).toHaveAttribute('data-domain', 'posts')
  })

  test('renders with all fields (canPublish=true)', async () => {
    mockedRoleCheck.mockResolvedValueOnce(true)
    mockedFindUnique.mockResolvedValueOnce({
      id: 'p2',
      title: 'T',
      summary: 'S',
      content: 'C',
      imgUrl: 'https://img',
      isPublished: true,
    } as Post)

    const jsx = await EditPost({ params: Promise.resolve({ postId: 'p2' }) })
    render(jsx)

    expect(screen.getByText('Steps completed: (4 / 4)')).toBeInTheDocument()

    const publish = screen.getByTestId('publish-button')
    expect(publish).toHaveAttribute('data-id', 'p2')
    expect(publish).toHaveAttribute('data-canpublish', 'true')
    expect(publish).toHaveAttribute('data-ispublished', 'true')
  })
})
