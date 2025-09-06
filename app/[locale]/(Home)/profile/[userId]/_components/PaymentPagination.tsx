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

interface PaymentPaginationProps {
  currentPage: number
  totalPages: number
  showPageInfo?: boolean
  totalItems?: number
}

export default function PaymentPagination({
  currentPage,
  totalPages,
  showPageInfo = false,
  totalItems,
}: PaymentPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const createPageUrl = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return ''

      const params = new URLSearchParams(searchParams)
      params.set('page', page.toString())
      return `?${params.toString()}`
    },
    [searchParams, totalPages]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return

      startTransition(() => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        router.push(`?${params.toString()}`)
      })
    },
    [router, searchParams, totalPages, currentPage]
  )

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const pageNumbers = useMemo(() => {
    const pages: Array<number | 'ellipsis-start' | 'ellipsis-end'> = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis-end')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis-start')
        for (let i = totalPages - 3; i <= totalPages - 1; i++) {
          pages.push(i)
        }
        pages.push(totalPages)
      } else {
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

  const hoverClasses = useMemo(() => {
    return 'hover:bg-bgColor-brandLighter transition-colors duration-200'
  }, [])

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center gap-4">
      {showPageInfo && totalItems != null && (
        <div className="text-sm text-muted-foreground">
          Showing page {currentPage} of {totalPages} ({totalItems} total records)
        </div>
      )}

      <Pagination className={cn(isPending && 'opacity-50 pointer-events-none')}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={!isFirstPage ? createPageUrl(currentPage - 1) : undefined}
              onClick={(e) => {
                e.preventDefault()
                if (!isFirstPage) handlePageChange(currentPage - 1)
              }}
              className={cn(
                hoverClasses,
                isFirstPage && 'opacity-50 cursor-not-allowed pointer-events-none'
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
                  className={cn(hoverClasses, isActive && 'cursor-default')}
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
                hoverClasses,
                isLastPage && 'opacity-50 cursor-not-allowed pointer-events-none'
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


