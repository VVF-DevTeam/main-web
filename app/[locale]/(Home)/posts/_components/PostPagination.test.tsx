import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostPagination from './PostPagination'
import { PaginationLink } from '@/components/ui/pagination'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams('?page=1'),
}))

// Mock pagination UI components
vi.mock('@/components/ui/pagination', () => ({
  Pagination: ({ children, className }: React.ComponentProps<'nav'>) => (
    <nav data-testid="pagination" className={className}>
      {children}
    </nav>
  ),
  PaginationContent: ({ children }: React.ComponentProps<'ul'>) => (
    <div data-testid="pagination-content">{children}</div>
  ),
  PaginationItem: ({ children }: React.ComponentProps<'li'>) => (
    <div data-testid="pagination-item">{children}</div>
  ),
  PaginationLink: ({
    children,
    href,
    isActive,
    onClick,
    className,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrent,
  }: React.ComponentProps<typeof PaginationLink>) => (
    <a
      data-testid="pagination-link"
      href={href}
      data-active={isActive}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  ),
  PaginationPrevious: ({
    href,
    onClick,
    className,
    'aria-disabled': ariaDisabled,
    'aria-label': ariaLabel,
  }: React.ComponentProps<typeof PaginationLink>) => (
    <a
      data-testid="pagination-previous"
      href={href}
      onClick={onClick}
      className={className}
      aria-disabled={ariaDisabled}
      aria-label={ariaLabel}
    >
      Previous
    </a>
  ),
  PaginationNext: ({
    href,
    onClick,
    className,
    'aria-disabled': ariaDisabled,
    'aria-label': ariaLabel,
  }: React.ComponentProps<typeof PaginationLink>) => (
    <a
      data-testid="pagination-next"
      href={href}
      onClick={onClick}
      className={className}
      aria-disabled={ariaDisabled}
      aria-label={ariaLabel}
    >
      Next
    </a>
  ),
  PaginationEllipsis: () => <span data-testid="pagination-ellipsis">...</span>,
}))

describe('PostPagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    showPageInfo: false,
    totalItems: 100,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders pagination with basic structure', () => {
    render(<PostPagination {...defaultProps} />)

    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-previous')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-next')).toBeInTheDocument()
  })

  test('shows page info when enabled', () => {
    const propsWithInfo = { ...defaultProps, showPageInfo: true }
    render(<PostPagination {...propsWithInfo} />)

    expect(
      screen.getByText('Showing page 1 of 10 (100 total posts)')
    ).toBeInTheDocument()
  })

  test('does not render when only one page', () => {
    const singlePageProps = { ...defaultProps, totalPages: 1 }
    const { container } = render(<PostPagination {...singlePageProps} />)

    expect(container.firstChild).toBeNull()
  })

  test('renders page numbers correctly', () => {
    render(<PostPagination {...defaultProps} />)

    // Should show first page, some middle pages, and last page
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()

    // Should show ellipsis for large page counts
    expect(screen.getByTestId('pagination-ellipsis')).toBeInTheDocument()
  })

  test('marks current page as active', () => {
    const currentPageProps = { ...defaultProps, currentPage: 3 }
    render(<PostPagination {...currentPageProps} />)

    const currentPageLink = screen
      .getByText('3')
      .closest('[data-testid="pagination-link"]')
    expect(currentPageLink).toHaveAttribute('data-active', 'true')
  })
})
