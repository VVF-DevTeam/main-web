'use client'
import { useCallback, useMemo, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

interface SocialPostPaginationProps {
  currentPage: number
  totalPages: number
  showPageInfo?: boolean
  totalItems?: number
}

const SocialPostPagination = ({
  currentPage,
  totalPages,
  showPageInfo = false,
  totalItems,
}: SocialPostPaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Memoize the page URL creation
  const createPageUrl = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return ''

      const params = new URLSearchParams(searchParams)
      params.set('socialPage', page.toString())
      return `?${params.toString()}`
    },
    [searchParams, totalPages]
  )

  // Optimized page change handler with loading state
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return

      startTransition(() => {
        const params = new URLSearchParams(searchParams)
        params.set('socialPage', page.toString())
        router.push(`?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams, totalPages, currentPage]
  )

  // Check if we're at boundaries
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  // Memoize page number generation for better performance
  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisiblePages = 5 // Show up to 5 page numbers at once

    if (totalPages <= maxVisiblePages) {
      // If total pages is small, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 2) {
        // Current page is near the beginning
        for (let i = 2; i <= 3; i++) {
          pages.push(i)
        }
        pages.push('ellipsis-end')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Current page is near the end
        pages.push('ellipsis-start')
        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
          pages.push(i)
        }
        pages.push(totalPages)
      } else {
        // Current page is in the middle
        pages.push('ellipsis-start')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis-end')
        pages.push(totalPages)
      }
    }

    return pages
  }, [currentPage, totalPages])

  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Page Information Display */}
      {showPageInfo && totalItems && (
        <div className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages} ({totalItems} total social
          posts)
        </div>
      )}

      {/* Last Page Message */}
      {isLastPage && (
        <div className="text-center text-sm text-muted-foreground mb-2">
          See older posts on our{' '}
          <a
            href="https://www.facebook.com/people/VIET-VIBE/61570910920072/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Facebook
          </a>
          {' '}and{' '}
          <a
            href="https://www.instagram.com/vietvibe.foundation/#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Instagram
          </a>
          {' '}pages
        </div>
      )}

      {/* Main Pagination */}
      <Pagination className={cn(isPending && 'pointer-events-none opacity-50')}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={!isFirstPage ? createPageUrl(currentPage - 1) : undefined}
              onClick={(e) => {
                e.preventDefault()
                if (!isFirstPage) handlePageChange(currentPage - 1)
              }}
              className={cn(
                'transition-colors duration-200 hover:bg-bgColor-brand400',
                isFirstPage &&
                  'pointer-events-none cursor-not-allowed opacity-50'
              )}
              aria-disabled={isFirstPage}
              aria-label={`Go to page ${currentPage - 1}`}
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href={createPageUrl(pageNum)}
                  isActive={isActive}
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(pageNum)
                  }}
                  className={cn(
                    'transition-colors duration-200 hover:bg-bgColor-brand400',
                    isActive && 'cursor-default'
                  )}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              href={!isLastPage ? createPageUrl(currentPage + 1) : undefined}
              onClick={(e) => {
                e.preventDefault()
                if (!isLastPage) handlePageChange(currentPage + 1)
              }}
              className={cn(
                'transition-colors duration-200 hover:bg-bgColor-brand400',
                isLastPage &&
                  'pointer-events-none cursor-not-allowed opacity-50'
              )}
              aria-disabled={isLastPage}
              aria-label={`Go to page ${currentPage + 1}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default SocialPostPagination
