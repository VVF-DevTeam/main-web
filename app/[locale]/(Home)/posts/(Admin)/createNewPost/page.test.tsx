// page.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest'

// --- Mocks that must be defined BEFORE importing './page' ---
vi.mock('next/navigation', () => ({
  __esModule: true,
  redirect: vi.fn(),
}))

vi.mock('@/lib/actions/user/roleCheck', () => ({
  __esModule: true,
  roleCheck: vi.fn(),
}))

//mock child component to avoid importing server-only/Next internals
vi.mock(
  '@/app/[locale]/(Home)/posts/(Admin)/createNewPost/_components/CreatePostForm',
  () => ({
    __esModule: true,
    default: () => null,
  })
)

// 👇 mock auth so importing the page doesn't try to resolve real next-auth
vi.mock('@/auth', () => ({
  __esModule: true,
  auth: vi.fn(async () => ({ user: { id: 'test-user' } })),
}))

// Now import the SUT after mocks are set up
import NewPost from './page'
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'

describe('NewPost', () => {
  const mockedRoleCheck = vi.mocked(roleCheck)
  const mockedRedirect = vi.mocked(redirect)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('redirects to /posts if user is not admin', async () => {
    mockedRoleCheck.mockResolvedValueOnce(false)

    await NewPost()

    expect(mockedRedirect).toHaveBeenCalledWith('/posts')
  })
})
